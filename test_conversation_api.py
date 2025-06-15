"""
Test script for conversation API endpoints
"""

import requests
import json

BASE_URL = "http://127.0.0.1:5000/api"

def test_create_conversation():
    """Test creating a new conversation"""
    print("Testing create conversation...")
    
    data = {
        "title": "Test Conversation"
        # "user_id": "test-user-123"  # Skip user_id for now
    }
    
    response = requests.post(f"{BASE_URL}/conversations", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 200:
        return response.json().get("conversation_id")
    return None

def test_get_conversations():
    """Test getting all conversations"""
    print("\nTesting get conversations...")
    
    response = requests.get(f"{BASE_URL}/conversations")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

def test_add_message(conversation_id):
    """Test adding a message to conversation"""
    if not conversation_id:
        print("No conversation ID to test with")
        return
        
    print(f"\nTesting add message to conversation {conversation_id}...")
    
    # Add user message
    data = {
        "role": "user",
        "content": "Hello, this is a test message"
    }
    
    response = requests.post(f"{BASE_URL}/conversations/{conversation_id}/messages", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Add assistant message
    data = {
        "role": "assistant", 
        "content": "Hello! I received your test message."
    }
    
    response = requests.post(f"{BASE_URL}/conversations/{conversation_id}/messages", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

def test_get_messages(conversation_id):
    """Test getting messages from conversation"""
    if not conversation_id:
        print("No conversation ID to test with")
        return
        
    print(f"\nTesting get messages from conversation {conversation_id}...")
    
    response = requests.get(f"{BASE_URL}/conversations/{conversation_id}/messages")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

def test_get_conversation(conversation_id):
    """Test getting a specific conversation"""
    if not conversation_id:
        print("No conversation ID to test with")
        return
        
    print(f"\nTesting get conversation {conversation_id}...")
    
    response = requests.get(f"{BASE_URL}/conversations/{conversation_id}")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

def test_delete_conversation(conversation_id):
    """Test deleting a conversation"""
    if not conversation_id:
        print("No conversation ID to test with")
        return
        
    print(f"\nTesting delete conversation {conversation_id}...")
    
    response = requests.delete(f"{BASE_URL}/conversations/{conversation_id}")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Verify deletion by trying to get the conversation
    print(f"\nVerifying deletion - trying to get deleted conversation...")
    response = requests.get(f"{BASE_URL}/conversations/{conversation_id}")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

if __name__ == "__main__":
    print("Testing Conversation API endpoints...")
    print("=" * 50)
    
    # Test create conversation
    conversation_id = test_create_conversation()
    
    # Test get all conversations
    test_get_conversations()
    
    # Test add messages
    test_add_message(conversation_id)
    
    # Test get messages
    test_get_messages(conversation_id)
    
    # Test get specific conversation
    test_get_conversation(conversation_id)
    
    # Test delete conversation (this should be last since it deletes the conversation)
    test_delete_conversation(conversation_id)
    
    print("\n" + "=" * 50)
    print("Testing completed!")