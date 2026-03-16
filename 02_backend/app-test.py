# test_openrouter.py
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from ai.services import openrouter_service
import logging
logging.basicConfig(level=logging.DEBUG)

print("=" * 50)
print("Testing OpenRouter Connection")
print("=" * 50)

try:
    # Test with a simple message
    response = openrouter_service.chat_completion(
        messages=[
            {'role': 'system', 'content': 'You are a helpful assistant.'},
            {'role': 'user', 'content': 'Say "Hello, I am working!" if you can hear me.'}
        ],
        feature='test'
    )
    
    print("\n✅ SUCCESS!")
    print(f"Response: {response['choices'][0]['message']['content']}")
    print(f"Model: {response.get('model')}")
    print(f"Usage: {response.get('usage')}")
    
except Exception as e:
    print(f"\n❌ ERROR: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()