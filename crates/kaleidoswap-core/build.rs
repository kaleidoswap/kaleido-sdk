use progenitor::Generator;
use std::env;
use std::fs;
use std::path::Path;

fn main() {
    let out_dir = env::var_os("OUT_DIR").unwrap();

    // Maker API
    let src = "specs/maker.json";
    println!("cargo:rerun-if-changed={}", src);
    if Path::new(src).exists() {
        let file = fs::File::open(src).expect("failed to open maker spec");
        let spec: openapiv3::OpenAPI =
            serde_json::from_reader(file).expect("failed to parse maker spec");
        let mut generator = Generator::default();

        // Generate tokens
        let tokens = generator
            .generate_tokens(&spec)
            .expect("failed to generate maker code");
        let content = tokens.to_string();

        let dest_path = Path::new(&out_dir).join("maker_api.rs");
        fs::write(&dest_path, content).expect("failed to write maker api");
    }

    // RLN API
    let src_rln = "specs/rln.yaml";
    println!("cargo:rerun-if-changed={}", src_rln);
    if Path::new(src_rln).exists() {
        let file = fs::File::open(src_rln).expect("failed to open rln spec");
        // Deserialize YAML to OpenAPI
        // Deserialize YAML to OpenAPI
        let mut spec: openapiv3::OpenAPI =
            serde_yaml::from_reader(file).expect("failed to parse rln spec");

        // Patch the spec to fix integer overflow issues
        if let Some(components) = &mut spec.components {
            if let Some(schema) = components.schemas.get_mut("NodeInfoResponse") {
                if let openapiv3::ReferenceOr::Item(openapiv3::Schema {
                    schema_kind: openapiv3::SchemaKind::Type(openapiv3::Type::Object(obj)),
                    ..
                }) = schema
                {
                    if let Some(prop) = obj.properties.get_mut("channel_asset_max_amount") {
                        // Handle ReferenceOr::Item manually since as_mut() isn't available
                        if let openapiv3::ReferenceOr::Item(s) = prop {
                            if let openapiv3::SchemaKind::Type(openapiv3::Type::Integer(int_type)) =
                                &mut s.schema_kind
                            {
                                int_type.format = openapiv3::VariantOrUnknownOrEmpty::Unknown(
                                    "uint64".to_string(),
                                );
                            }
                        }
                    }
                }
            }
        }

        let mut generator = Generator::default();

        let tokens = generator
            .generate_tokens(&spec)
            .expect("failed to generate rln code");
        let content = tokens.to_string();

        let dest_path = Path::new(&out_dir).join("rln_api.rs");
        fs::write(&dest_path, content).expect("failed to write rln api");
    }
}
