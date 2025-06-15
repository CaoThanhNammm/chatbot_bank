"""
Test script for DELETE conversation API endpoint
"""

import requests
import json

BASE_URL = "http://127.0.0.1:5000/api"

def create_test_conversation():
    """Create a test conversation for deletion"""
    print("Creating a test conversation...")
    
    data = {
        "title": "Test Conversation for Deletion"
    }
    
    response = requests.post(f"{BASE_URL}/conversations", json=data)
    print(f"Create Status: {response.status_code}")
    print(f"Create Response: {response.json()}")
    
    if response.status_code == 200:
        return response.json().get("conversation_id")
    return None

def add_test_messages(conversation_id):
    """Add some test messages to the conversation"""
    if not conversation_id:
        return
        
    print(f"\nAdding test messages to conversation {conversation_id}...")
    
    messages = [
        {"role": "user", "content": "Hello, this is a test message"},
        {"role": "assistant", "content": "Hello! I received your test message."},
        {"role": "user", "content": "Can you help me with something?"},
        {"role": "assistant", "content": "Of course! I'm here to help."}
    ]
    
    for msg in messages:
        response = requests.post(f"{BASE_URL}/conversations/{conversation_id}/messages", json=msg)
        print(f"Message Status: {response.status_code}")

def test_delete_conversation(conversation_id):
    """Test deleting a conversation"""
    if not conversation_id:
        print("No conversation ID to test with")
        return False
        
    print(f"\n{'='*50}")
    print(f"TESTING DELETE CONVERSATION: {conversation_id}")
    print(f"{'='*50}")
    
    # First, verify the conversation exists
    print("\n1. Verifying conversation exists before deletion...")
    response = requests.get(f"{BASE_URL}/conversations/{conversation_id}")
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print(f"   ✓ Conversation exists: {response.json()['conversation']['title']}")
    else:
        print(f"   ✗ Conversation not found")
        return False
    
    # Check messages exist
    print("\n2. Checking messages before deletion...")
    response = requests.get(f"{BASE_URL}/conversations/{conversation_id}/messages")
    if response.status_code == 200:
        messages = response.json().get('messages', [])
        print(f"   ✓ Found {len(messages)} messages")
    
    # Now delete the conversation
    print(f"\n3. Deleting conversation {conversation_id}...")
    response = requests.delete(f"{BASE_URL}/conversations/{conversation_id}")
    print(f"   Delete Status: {response.status_code}")
    print(f"   Delete Response: {response.json()}")
    
    if response.status_code == 200:
        print("   ✓ Conversation deleted successfully")
    else:
        print("   ✗ Failed to delete conversation")
        return False
    
    # Verify deletion by trying to get the conversation
    print("\n4. Verifying deletion - trying to get deleted conversation...")
    response = requests.get(f"{BASE_URL}/conversations/{conversation_id}")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    
    if response.status_code == 404:
        print("   ✓ Conversation successfully deleted (404 Not Found)")
        return True
    else:
        print("   ✗ Conversation still exists after deletion")
        return False

def test_delete_nonexistent_conversation():
    """Test deleting a non-existent conversation"""
    print(f"\n{'='*50}")
    print("TESTING DELETE NON-EXISTENT CONVERSATION")
    print(f"{'='*50}")
    
    fake_id = "non-existent-conversation-id"
    print(f"\nTrying to delete non-existent conversation: {fake_id}")
    
    response = requests.delete(f"{BASE_URL}/conversations/{fake_id}")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 404:
        print("✓ Correctly returned 404 for non-existent conversation")
        return True
    else:
        print("✗ Unexpected response for non-existent conversation")
        return False

if __name__ == "__main__":
    print("Testing DELETE Conversation API endpoint...")
    print("=" * 60)
    
    # Test 1: Delete existing conversation
    conversation_id = create_test_conversation()
    if conversation_id:
        add_test_messages(conversation_id)
        success1 = test_delete_conversation(conversation_id)
    else:
        print("Failed to create test conversation")
        success1 = False
    
    # Test 2: Delete non-existent conversation
    success2 = test_delete_nonexistent_conversation()
    
    # Summary
    print(f"\n{'='*60}")
    print("TEST SUMMARY")
    print(f"{'='*60}")
    print(f"Delete existing conversation: {'✓ PASSED' if success1 else '✗ FAILED'}")
    print(f"Delete non-existent conversation: {'✓ PASSED' if success2 else '✗ FAILED'}")
    print(f"\nOverall: {'✓ ALL TESTS PASSED' if success1 and success2 else '✗ SOME TESTS FAILED'}")