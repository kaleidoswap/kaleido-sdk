import sys
import yaml
import os

def clean(obj):
    if isinstance(obj, dict):
        if "example" in obj:
            del obj["example"]
        if "examples" in obj:
            del obj["examples"]
        for k, v in list(obj.items()):
            clean(v)
    elif isinstance(obj, list):
        for i in obj:
            clean(i)

def remove_multipart(spec):
    if "paths" not in spec:
        return
    
    paths_to_remove = []
    
    for path, path_item in spec["paths"].items():
        if not isinstance(path_item, dict):
            continue
            
        verbs_to_remove = []
        for method, op in path_item.items():
            if not isinstance(op, dict):
                continue
            
            # Check for multipart/form-data in requestBody
            is_multipart = False
            if "requestBody" in op:
                content = op["requestBody"].get("content", {})
                if "multipart/form-data" in content:
                    is_multipart = True
            
            if is_multipart:
                verbs_to_remove.append(method)
                print(f"   - Removing {method.upper()} {path} (unsupported multipart/form-data)")
        
        for verb in verbs_to_remove:
            del path_item[verb]
            
        if not path_item: # If path is empty, remove it
            paths_to_remove.append(path)
            
    for path in paths_to_remove:
        del spec["paths"][path]

def add_operation_ids(spec):
    if "paths" not in spec:
        return
    
    for path, path_item in spec["paths"].items():
        if not isinstance(path_item, dict):
            continue
            
        for method, op in path_item.items():
            if method.lower() in ["get", "post", "put", "delete", "patch", "options", "head"] and isinstance(op, dict):
                if "operationId" not in op:
                    clean_path = path.strip("/").replace("/", "_").replace("-", "_").replace("{", "").replace("}", "")
                    op_id = f"{method.lower()}_{clean_path}"
                    op["operationId"] = op_id

if len(sys.argv) < 2:
    print("Usage: sanitize_rln.py <path>")
    sys.exit(1)

path = sys.argv[1]
print(f"Sanitizing {path}...")
try:
    with open(path, "r") as f:
        data = yaml.safe_load(f)

    clean(data)
    remove_multipart(data)
    add_operation_ids(data)

    with open(path, "w") as f:
        yaml.dump(data, f, sort_keys=False)
    print(f"✅ Sanitized {path} (Examples removed, Multipart removed, OperationIDs added)")
except Exception as e:
    print(f"❌ Failed to sanitize: {e}")
    sys.exit(1)
