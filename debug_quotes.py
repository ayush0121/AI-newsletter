import requests
try:
    r = requests.get('http://127.0.0.1:8000/api/v1/quotes/daily')
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text}")
except Exception as e:
    print(f"Error: {e}")
