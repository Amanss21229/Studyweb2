# API Documentation

## Base URL
```
Production: https://your-app.onrender.com
Development: http://localhost:5000
```

## Authentication

All API requests require an API key. Include it in the request header:

```
X-API-Key: your-api-key-here
```

## Endpoints

### 1. Generate Solution (for Telegram Bot)

Get an AI-generated solution for a NEET/JEE question.

**Endpoint:** `POST /api/solution`

**Headers:**
```
Content-Type: application/json
X-API-Key: your-api-key
```

**Request Body:**
```json
{
  "question": "Explain the photoelectric effect",
  "language": "english",
  "userName": "Rahul"
}
```

**Parameters:**
- `question` (required): The question text
- `language` (optional): "english" or "hindi" (default: "english")
- `userName` (optional): User's name for personalized responses

**Response:**
```json
{
  "success": true,
  "solutionUrl": "https://your-app.onrender.com/solution/abc123xyz",
  "solution": {
    "answer": "The photoelectric effect is...",
    "subject": "physics",
    "chapter": "Dual Nature of Radiation",
    "topic": "Photoelectric Effect",
    "neetJeePyq": {
      "neet": ["2023", "2021"],
      "jee": ["2024", "2023"]
    }
  }
}
```

**Error Responses:**

401 Unauthorized:
```json
{
  "error": "Invalid API key",
  "message": "The provided API key is invalid or has been revoked"
}
```

400 Bad Request:
```json
{
  "error": "Question is required"
}
```

500 Internal Server Error:
```json
{
  "error": "Failed to generate solution"
}
```

## API Key Management

### Security Note

API keys are hashed using SHA-256 before storage. The plaintext key is only shown once during creation. Make sure to save it securely - you won't be able to retrieve it again.

### Generate API Key

**Endpoint:** `POST /api/keys`

**Authentication:** Requires Replit/Google login (session-based)

**Request Body:**
```json
{
  "name": "Telegram Bot"
}
```

**Response:**
```json
{
  "id": "key-id",
  "name": "Telegram Bot",
  "key": "abc123...xyz",
  "createdAt": "2025-10-05T10:00:00.000Z",
  "message": "API key created successfully. Save this key securely - it will not be shown again."
}
```

**Important:** The `key` field contains the plaintext API key. This is the ONLY time you'll see it. Store it securely.

### List API Keys

**Endpoint:** `GET /api/keys`

**Authentication:** Requires session login

**Response:**
```json
[
  {
    "id": "key-id",
    "name": "Telegram Bot",
    "key": "abc12345...wxyz",
    "lastUsed": "2025-10-05T10:00:00.000Z",
    "isActive": true,
    "createdAt": "2025-10-01T10:00:00.000Z"
  }
]
```

Note: API keys are masked except for the first 8 and last 4 characters.

### Revoke API Key

**Endpoint:** `DELETE /api/keys/:id`

**Authentication:** Requires session login

**Response:**
```json
{
  "message": "API key revoked successfully"
}
```

## Rate Limiting

Currently, there are no hard rate limits. However, please use the API responsibly:
- Recommended: Max 10 requests per second per API key
- For high-volume usage, contact support

## Example: Telegram Bot Integration

### Python Example

```python
import requests

API_URL = "https://your-app.onrender.com/api/solution"
API_KEY = "your-api-key-here"

def get_solution(question, language="english", user_name=None):
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY
    }
    
    payload = {
        "question": question,
        "language": language
    }
    
    if user_name:
        payload["userName"] = user_name
    
    response = requests.post(API_URL, json=payload, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: {response.status_code}")
        print(response.json())
        return None

# Usage
result = get_solution(
    question="What is photosynthesis?",
    language="english",
    user_name="Priya"
)

if result:
    print(f"Answer: {result['solution']['answer']}")
    print(f"Share URL: {result['solutionUrl']}")
```

### Node.js Example

```javascript
const axios = require('axios');

const API_URL = 'https://your-app.onrender.com/api/solution';
const API_KEY = 'your-api-key-here';

async function getSolution(question, language = 'english', userName = null) {
    try {
        const response = await axios.post(API_URL, {
            question,
            language,
            userName
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY
            }
        });
        
        return response.data;
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        return null;
    }
}

// Usage
(async () => {
    const result = await getSolution(
        'Explain Newton\'s first law',
        'english',
        'Amit'
    );
    
    if (result) {
        console.log('Answer:', result.solution.answer);
        console.log('Share URL:', result.solutionUrl);
    }
})();
```

## Support

For API support or questions:
1. Check the deployment guide (RENDER_DEPLOYMENT.md)
2. Review error messages carefully
3. Ensure your API key is active and not revoked
