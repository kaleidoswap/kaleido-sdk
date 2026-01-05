import sys
import json
import os

def clean_schema(obj):
    if isinstance(obj, dict):
        # Fix exclusiveMinimum (3.1 number -> 3.0 bool)
        if "exclusiveMinimum" in obj and isinstance(obj["exclusiveMinimum"], (int, float)):
            obj["minimum"] = obj["exclusiveMinimum"]
            obj["exclusiveMinimum"] = True
        
        # Fix optional (anyOf with null)
        if "anyOf" in obj:
            any_of = obj["anyOf"]
            non_null = [x for x in any_of if x.get("type") != "null"]
            if len(non_null) == 1 and len(any_of) == 2:
                 target = non_null[0]
                 if "$ref" in target:
                     obj["allOf"] = [target]
                     obj["nullable"] = True
                     del obj["anyOf"]
                 else:
                     obj.update(target)
                     obj["nullable"] = True
                     del obj["anyOf"]

        for k, v in obj.items():
            clean_schema(v)
    elif isinstance(obj, list):
        for item in obj:
            clean_schema(item)

def clean_operation_ids(spec):
    if "paths" not in spec:
        return
    
    seen_ids = set()
    
    for path, path_item in spec["paths"].items():
        if not isinstance(path_item, dict):
            continue
            
        for method, op in path_item.items():
            if method.lower() in ["get", "post", "put", "delete", "patch"] and isinstance(op, dict):
                if "operationId" in op:
                    old_id = op["operationId"]
                    # FastAPI renaming: list_assets_api_v1_market_assets_get -> list_assets
                    if "_api_v1_" in old_id:
                        new_id = old_id.split("_api_v1_")[0]
                        
                        # Check collision
                        if new_id in seen_ids:
                            # print(f"   ! Collision for {new_id}, keeping {old_id}")
                            seen_ids.add(old_id)
                        else:
                            op["operationId"] = new_id
                            seen_ids.add(new_id)
                            # print(f"   Renamed {old_id} -> {new_id}")
                    else:
                        seen_ids.add(old_id)

if len(sys.argv) < 2:
    print("Usage: sanitize_maker.py <path>")
    sys.exit(1)

path = sys.argv[1]
print(f"Sanitizing Maker Spec {path}...")

try:
    with open(path, "r") as f:
        spec = json.load(f)

    # Downgrade version
    spec["openapi"] = "3.0.3"

    # Fix schemas
    clean_schema(spec)

    # Fix Operation IDs
    clean_operation_ids(spec)

    with open(path, "w") as f:
        json.dump(spec, f, indent=2)

    print("✅ Sanitized Maker Spec")
except Exception as e:
    print(f"❌ Failed to sanitize Maker Spec: {e}")
    sys.exit(1)
