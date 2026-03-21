import requests
import uuid
import json

base_url = "http://localhost:8080/api/v1"
account_id = "f76cc4c8-7362-496f-a5b8-6ced209eb357" # Random but valid UUID

test_data = {
    "cardNickname": "카드 이미지 테스트",
    "issuerId": "shinhan",
    "brandId": "visa",
    "cardType": "CREDIT",
    "cardNumberFirstFour": "4521",
    "cardNumberLastFour": "8888",
    "expiryMonth": "12",
    "expiryYear": "28",
    "monthlyTargetAmount": 300000,
    "annualTargetAmount": 3600000,
    "features": ["cashback", "points"],
    "isNotificationEnabled": True,
    "isMain": True,
    "isPinned": False,
    "imageUrl": "/images/cards/shinhan_deepdream.png"
}

headers = {
    "Content-Type": "application/json",
    "X-Account-Id": account_id
}

def test_registration():
    try:
        url = f"{base_url}/my-cards/detailed"
        print(f"Calling API: {url}")
        response = requests.post(url, headers=headers, data=json.dumps(test_data))
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200 or response.status_code == 201:
            print("Registration Successful!")
            return True
        else:
            print("Registration Failed!")
            return False
    except Exception as e:
        print(f"Error during API call: {e}")
        return False

if __name__ == "__main__":
    test_registration()
