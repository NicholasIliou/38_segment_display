import json

def sort_json():
    with open("../src/patterns.json","r") as f:
        data = json.load(f)

        sorted_data = {key: data[key] for key in sorted(data.keys())}

        with open("../src/patterns.json","w") as f:
            json.dump(sorted_data, f, indent=4)

def host_locally():
    print("http://localhost:8000")
    import subprocess
    subprocess.run(["python", "-m", "http.server", "8000"])

if __name__ == "__main__":
    host_locally()