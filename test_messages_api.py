#!/usr/bin/env python3
"""
Test script to check the structure of conversation messages API response
"""

import requests
import json

# API base URL
BASE_URL = "http://127.0.0.1:5000/api"

def test_conversation_messages():
    """Test getting conversation messages"""
    
    # First, get all conversations to find one with messages
    try:
        print("Getting conversations...")
        conversations_response = requests.get(f"{BASE_URL}/conversations")
        print(f"Conversations response status: {conversations_response.status_code}")
        
        if conversations_response.status_code == 200:
            conversations_data = conversations_response.json()
            print("Conversations response structure:")
            print(json.dumps(conversations_data, indent=2, default=str))
            
            # Get conversations list
            conversations = []
            if 'data' in conversations_data and 'conversations' in conversations_data['data']:
                conversations = conversations_data['data']['conversations']
            elif 'conversations' in conversations_data:
                conversations = conversations_data['conversations']
            elif isinstance(conversations_data, list):
                conversations = conversations_data
                
            print(f"\nFound {len(conversations)} conversations")
            
            # Test getting messages for each conversation
            for conv in conversations[:3]:  # Test first 3 conversations
                conv_id = conv.get('id')
                if conv_id:
                    print(f"\n--- Testing conversation {conv_id} ---")
                    print(f"Title: {conv.get('title', 'No title')}")
                    
                    # Get messages for this conversation
                    messages_response = requests.get(f"{BASE_URL}/conversations/{conv_id}/messages")
                    print(f"Messages response status: {messages_response.status_code}")
                    
                    if messages_response.status_code == 200:
                        messages_data = messages_response.json()
                        print("Messages response structure:")
                        print(json.dumps(messages_data, indent=2, default=str))
                        
                        # Analyze message structure
                        messages = []
                        if 'data' in messages_data and 'messages' in messages_data['data']:
                            messages = messages_data['data']['messages']
                        elif 'messages' in messages_data:
                            messages = messages_data['messages']
                        elif isinstance(messages_data, list):
                            messages = messages_data
                            
                        print(f"Found {len(messages)} messages")
                        
                        if messages:
                            print("Sample message structure:")
                            sample_msg = messages[0]
                            print(f"Fields: {list(sample_msg.keys())}")
                            for field, value in sample_msg.items():
                                print(f"  {field}: {type(value).__name__} = {value}")
                    else:
                        print(f"Failed to get messages: {messages_response.text}")
        else:
            print(f"Failed to get conversations: {conversations_response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_conversation_messages()