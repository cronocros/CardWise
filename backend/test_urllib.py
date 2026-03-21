import urllib.request
import json
import uuid

url = "http://127.0.0.1:8080/api/v1/my-cards/detailed"
account_id = "f76cc4c8-7362-496f-a5b8-6ced209eb357"

test_data = {
    "cardNickname": "Urllib Test",
    "issuerId": "shinhan",
    "brandId": "visa",
    "cardType": "CREDIT",
    "cardNumberFirstFour": "4521",
    "cardNumberLastFour": "8888",
    "expiryMonth": "12",
    "expiryYear": "28",
    "monthlyTargetAmount": 1000,
    "annualTargetAmount": 12000,
    "features": ["points"],
    "isNotificationEnabled": False,
    "isMain": False,
    "isPinned": False,
    "imageUrl": "/images/cards/shinhan_deepdream.png"
}

headers = {
    "Content-Type": "application/json",
    "X-Account-Id": account_id
}

def test():
    try:
        req = urllib.request.Request(url, data=json.dumps(test_data).encode(), headers=headers)
        with urllib.request.urlopen(req) as f:
            print(f.status)
            print(f.read().decode())
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.read().decode()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test()
