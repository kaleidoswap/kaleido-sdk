#!/usr/bin/env python3
"""
Generate Rust models from OpenAPI specifications.

This script converts OpenAPI specs to Rust models using a custom generator
that handles OpenAPI 3.1.0 specs with complex types.

Usage: python scripts/generate_models.py
"""

import json
import os
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

# Rust type mappings
TYPE_MAP = {
    "string": "String",
    "integer": "i64",
    "number": "f64",
    "boolean": "bool",
    "array": "Vec",
    "object": "serde_json::Value",
}

FORMAT_MAP = {
    "int32": "i32",
    "int64": "i64",
    "float": "f32",
    "double": "f64",
    "date-time": "String",  # Could use chrono::DateTime
    "date": "String",
    "uuid": "String",
    "uri": "String",
    "byte": "Vec<u8>",
}


def to_rust_name(name: str) -> str:
    """Convert a name to valid Rust identifier (PascalCase for types)."""
    # Handle special cases
    name = name.replace("-", "_").replace(".", "_")
    # Convert to PascalCase
    parts = re.split(r'[_\s]+', name)
    return ''.join(word.capitalize() for word in parts)


def to_snake_case(name: str) -> str:
    """Convert a name to snake_case for fields."""
    name = name.replace("-", "_").replace(".", "_")
    # Insert underscore before uppercase letters
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    result = re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()
    
    # Handle Rust keywords
    RUST_KEYWORDS = {
        "type", "as", "break", "const", "continue", "crate", "else", "enum",
        "extern", "false", "fn", "for", "if", "impl", "in", "let", "loop",
        "match", "mod", "move", "mut", "pub", "ref", "return", "self", "Self",
        "static", "struct", "super", "trait", "true", "unsafe", "use", "where",
        "while", "async", "await", "dyn", "abstract", "become", "box", "do",
        "final", "macro", "override", "priv", "typeof", "unsized", "virtual", "yield"
    }
    
    if result in RUST_KEYWORDS:
        return f"r#{result}"
    
    return result


def sanitize_description(desc: str) -> str:
    """Sanitize description for Rust doc comments.
    
    Converts multiline descriptions to proper /// comments
    and escapes any problematic characters.
    """
    if not desc:
        return desc
    # Split into lines and prefix each with ///
    lines = desc.strip().split('\n')
    if len(lines) == 1:
        # Single line - just escape any problematic chars
        return lines[0].replace('\r', '')
    else:
        # Multiline - each line needs /// prefix
        result = []
        for i, line in enumerate(lines):
            line = line.strip().replace('\r', '')
            if i == 0:
                result.append(line)  # First line is already after ///
            else:
                result.append(f"/// {line}" if line else "///")
        return '\n'.join(result)


def get_rust_type(schema: Dict[str, Any], required: bool = True) -> str:
    """Convert OpenAPI schema to Rust type."""
    if not schema:
        return "serde_json::Value"
    
    # Handle $ref
    if "$ref" in schema:
        ref = schema["$ref"]
        type_name = ref.split("/")[-1]
        rust_type = to_rust_name(type_name)
        return f"Box<{rust_type}>" if not required else rust_type
    
    # Handle anyOf/oneOf - these are often complex unions, use dynamic JSON
    if "anyOf" in schema or "oneOf" in schema:
        variants = schema.get("anyOf") or schema.get("oneOf", [])
        # Filter out null types
        non_null = [v for v in variants if v.get("type") != "null"]
        has_null = any(v.get("type") == "null" for v in variants)
        
        if len(non_null) == 1:
            inner_type = get_rust_type(non_null[0], required=True)
            if has_null:
                return f"Option<{inner_type}>"
            return inner_type
        elif len(non_null) == 0:
            return "()"
        else:
            # Multiple non-null types - use dynamic JSON
            return "serde_json::Value"
    
    # Handle allOf (combine schemas)
    if "allOf" in schema:
        # Take the first concrete type
        for item in schema["allOf"]:
            if "$ref" in item:
                return get_rust_type(item, required)
        return "serde_json::Value"
    
    schema_type = schema.get("type")
    schema_format = schema.get("format")
    
    # Handle null type
    if schema_type == "null":
        return "()"
    
    # Handle arrays
    if schema_type == "array":
        items = schema.get("items", {})
        item_type = get_rust_type(items, required=True)
        return f"Vec<{item_type}>"
    
    # Handle objects with additionalProperties
    if schema_type == "object":
        if "additionalProperties" in schema:
            add_props = schema["additionalProperties"]
            if isinstance(add_props, dict):
                value_type = get_rust_type(add_props, required=True)
                return f"std::collections::HashMap<String, {value_type}>"
            return "std::collections::HashMap<String, serde_json::Value>"
        # Regular object without properties defined
        if "properties" not in schema:
            return "serde_json::Value"
    
    # Handle format-specific types
    if schema_format and schema_format in FORMAT_MAP:
        return FORMAT_MAP[schema_format]
    
    # Handle basic types
    if schema_type and schema_type in TYPE_MAP:
        return TYPE_MAP[schema_type]
    
    return "serde_json::Value"


def generate_enum(name: str, schema: Dict[str, Any]) -> str:
    """Generate a Rust enum from an OpenAPI schema."""
    rust_name = to_rust_name(name)
    description = sanitize_description(schema.get("description", f"{name} enum."))
    values = schema["enum"]
    
    lines = [
        f"/// {description}",
        "#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]",
        f"pub enum {rust_name} {{",
    ]
    
    for value in values:
        variant_name = to_rust_name(value.replace(" ", ""))
        if variant_name != value:
            lines.append(f'    #[serde(rename = "{value}")]')
        lines.append(f"    {variant_name},")
    
    lines.append("}")
    lines.append("")
    
    return "\n".join(lines)


def generate_struct(name: str, schema: Dict[str, Any]) -> str:
    """Generate a Rust struct from an OpenAPI schema."""
    rust_name = to_rust_name(name)
    properties = schema.get("properties", {})
    required = set(schema.get("required", []))
    description = sanitize_description(schema.get("description", f"{name} model."))
    
    lines = [
        f"/// {description}",
        "#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]",
        f"pub struct {rust_name} {{",
    ]
    
    for prop_name, prop_schema in properties.items():
        field_name = to_snake_case(prop_name)
        is_required = prop_name in required
        
        # Get the base type
        rust_type = get_rust_type(prop_schema, required=is_required)
        
        # Wrap in Option if not required
        if not is_required and not rust_type.startswith("Option<"):
            rust_type = f"Option<{rust_type}>"
        
        # Add serde rename if needed
        if field_name != prop_name:
            lines.append(f'    #[serde(rename = "{prop_name}")]')
        
        # Add default for Option fields
        if rust_type.startswith("Option<"):
            lines.append("    #[serde(default)]")
        
        # Add the field
        prop_desc = sanitize_description(prop_schema.get("description", ""))
        if prop_desc:
            lines.append(f"    /// {prop_desc}")
        lines.append(f"    pub {field_name}: {rust_type},")
    
    lines.append("}")
    lines.append("")
    
    return "\n".join(lines)


def generate_models(spec: Dict[str, Any]) -> str:
    """Generate all models from an OpenAPI spec."""
    schemas = spec.get("components", {}).get("schemas", {})
    
    lines = [
        "//! Auto-generated models from OpenAPI specification.",
        "//!",
        "//! DO NOT EDIT - This file is generated by scripts/generate_models.py",
        "",
        "use serde::{Deserialize, Serialize};",
        "",
    ]
    
    # Sort schemas to handle dependencies (simple approach)
    for name, schema in sorted(schemas.items()):
        # Skip validation error types
        if name in ("HTTPValidationError", "ValidationError"):
            continue
        
        # Handle enums
        if "enum" in schema:
            lines.append(generate_enum(name, schema))
        # Handle objects (structs)
        elif schema.get("type") == "object" or "properties" in schema:
            lines.append(generate_struct(name, schema))
    
    return "\n".join(lines)


def main():
    script_dir = Path(__file__).parent
    root_dir = script_dir.parent
    specs_dir = root_dir / "specs"
    output_dir = root_dir / "crates" / "kaleidoswap-core" / "src" / "models"
    
    print("🔧 Kaleidoswap SDK Model Generator (Python)")
    print("=" * 50)
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate Kaleidoswap models
    kaleido_spec_path = specs_dir / "kaleidoswap.json"
    if kaleido_spec_path.exists():
        print(f"\n📄 Generating models from: {kaleido_spec_path.name}")
        with open(kaleido_spec_path) as f:
            spec = json.load(f)
        
        models = generate_models(spec)
        output_file = output_dir / "kaleidoswap.rs"
        output_file.write_text(models)
        print(f"✅ Generated: {output_file}")
    else:
        print(f"❌ Spec not found: {kaleido_spec_path}")
    
    # Generate RGB Node models
    rgb_spec_path = specs_dir / "rgb-lightning-node.yaml"
    if rgb_spec_path.exists():
        print(f"\n📄 Generating models from: {rgb_spec_path.name}")
        try:
            import yaml
            with open(rgb_spec_path) as f:
                spec = yaml.safe_load(f)
            
            models = generate_models(spec)
            
            # Add type alias for Assignment (abstract union type in the spec)
            models = models.replace(
                "use serde::{Deserialize, Serialize};",
                """use serde::{Deserialize, Serialize};

/// Type alias for Assignment - maps to dynamic JSON value as it's a union type
pub type Assignment = serde_json::Value;"""
            )
            
            output_file = output_dir / "rgb_node.rs"
            output_file.write_text(models)
            print(f"✅ Generated: {output_file}")
        except ImportError:
            print("⚠️  PyYAML not installed. Run: pip install pyyaml")
    else:
        print(f"❌ Spec not found: {rgb_spec_path}")
    
    # Only create mod.rs if it doesn't exist (preserve custom type aliases)
    mod_rs = output_dir / "mod.rs"
    if not mod_rs.exists():
        mod_rs.write_text("""//! Auto-generated models from OpenAPI specifications.
//!
//! DO NOT EDIT - Regenerate with: python scripts/generate_models.py

mod kaleidoswap;
mod rgb_node;

pub use kaleidoswap::*;
pub use rgb_node::*;
""")
        print(f"✅ Created: {mod_rs}")
    else:
        print(f"ℹ️  Preserved existing: {mod_rs}")
    
    print(f"\n✅ Model generation complete!")
    print(f"   Output: {output_dir}")


if __name__ == "__main__":
    main()

