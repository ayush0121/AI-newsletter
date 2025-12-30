import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_api():
    print(f"Testing API at {BASE_URL}")
    
    try:
        # Test 1: Today's Articles
        print("\n--- GET /articles/today ---")
        response = requests.get(f"{BASE_URL}/articles/today")
        if response.status_code == 200:
            data = response.json()
            print(f"Status: {response.status_code}")
            print(f"Count: {len(data)}")
            if len(data) > 0:
                print(f"Sample: {data[0].get('title')}")
            else:
                print("Response is empty list []")
        else:
            print(f"Error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"Failed to connect: {e}")

if __name__ == "__main__":
    test_api()
