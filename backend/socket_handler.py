from flask import request
from flask_socketio import SocketIO, emit
import uuid
from datetime import datetime

# Initialize Flask-SocketIO
socketio = SocketIO()

# Store connected clients
clients = {}
# Queue for users waiting for random chat
chat_queue = []
# Queue for users waiting for random call
call_queue = []

def init_socket(app):
    socketio.init_app(app, cors_allowed_origins="*")
    
    @socketio.on('connect')
    def handle_connect():
        client_id = str(uuid.uuid4())
        clients[client_id] = {
            'id': client_id,
            'socket_id': request.sid,
            'username': f"user_{client_id[:8]}",
            'status': 'available',
            'partner': None
        }
        
    @socketio.on('disconnect')
    def handle_disconnect():
        client_id = None
        for cid, client in clients.items():
            if client['socket_id'] == request.sid:
                client_id = cid
                break
        
        if not client_id:
            return
        
        client = clients[client_id]
        
        # Notify partner if in a chat or call
        if client['partner']:
            partner_id = client['partner']
            if partner_id in clients:
                partner = clients[partner_id]
                partner_sid = partner['socket_id']
                
                if client['status'] == 'chatting':
                    emit('chat_ended', {'reason': 'partnerLeft'}, room=partner_sid)
                elif client['status'] == 'calling':
                    emit('call_ended', {'reason': 'partnerLeft'}, room=partner_sid)
                
                partner['status'] = 'available'
                partner['partner'] = None
        
        # Remove from queues
        if client_id in chat_queue:
            chat_queue.remove(client_id)
        
        if client_id in call_queue:
            call_queue.remove(client_id)
        
        # Remove client
        del clients[client_id]
        
    @socketio.on('set_user_data')
    def handle_set_user_data(data):
        client_id = None
        for cid, client in clients.items():
            if client['socket_id'] == request.sid:
                client_id = cid
                break
        
        if not client_id:
            return
        
        if 'username' in data:
            clients[client_id]['username'] = data['username']
        
    @socketio.on('find_random_chat')
    def handle_find_random_chat():
        client_id = None
        for cid, client in clients.items():
            if client['socket_id'] == request.sid:
                client_id = cid
                break
        
        if not client_id:
            return
        
        client = clients[client_id]
        
        # Remove from any existing queue
        if client_id in chat_queue:
            chat_queue.remove(client_id)
        
        # Update status
        client['status'] = 'available'
        
        # Check if someone is waiting
        if chat_queue:
            partner_id = chat_queue.pop(0)
            if partner_id in clients:
                partner = clients[partner_id]
                
                # Match found, connect them
                client['status'] = 'chatting'
                client['partner'] = partner_id
                partner['status'] = 'chatting'
                partner['partner'] = client_id
                
                # Notify both clients
                emit('chat_connected', {
                    'partnerId': partner_id,
                    'partnerName': partner['username']
                }, room=request.sid)
                
                emit('chat_connected', {
                    'partnerId': client_id,
                    'partnerName': client['username']
                }, room=partner['socket_id'])
            else:
                # Partner disconnected, try again
                chat_queue.append(client_id)
        else:
            # No one waiting, add to queue
            chat_queue.append(client_id)
            emit('searching', {'mode': 'chat'}, room=request.sid)
        
    @socketio.on('find_random_call')
    def handle_find_random_call():
        client_id = None
        for cid, client in clients.items():
            if client['socket_id'] == request.sid:
                client_id = cid
                break
        
        if not client_id:
            return
        
        client = clients[client_id]
        
        # Remove from any existing queue
        if client_id in call_queue:
            call_queue.remove(client_id)
        
        # Update status
        client['status'] = 'available'
        
        # Check if someone is waiting
        if call_queue:
            partner_id = call_queue.pop(0)
            if partner_id in clients:
                partner = clients[partner_id]
                
                # Match found, connect them
                client['status'] = 'calling'
                client['partner'] = partner_id
                partner['status'] = 'calling'
                partner['partner'] = client_id
                
                # Notify both clients
                emit('call_connected', {
                    'partnerId': partner_id,
                    'partnerName': partner['username']
                }, room=request.sid)
                
                emit('call_connected', {
                    'partnerId': client_id,
                    'partnerName': client['username']
                }, room=partner['socket_id'])
            else:
                # Partner disconnected, try again
                call_queue.append(client_id)
        else:
            # No one waiting, add to queue
            call_queue.append(client_id)
            emit('searching', {'mode': 'call'}, room=request.sid)
        
    @socketio.on('cancel_search')
    def handle_cancel_search():
        client_id = None
        for cid, client in clients.items():
            if client['socket_id'] == request.sid:
                client_id = cid
                break
        
        if not client_id:
            return
        
        # Remove from queues
        if client_id in chat_queue:
            chat_queue.remove(client_id)
        
        if client_id in call_queue:
            call_queue.remove(client_id)
        
        clients[client_id]['status'] = 'available'
        emit('search_cancelled', room=request.sid)
        
    @socketio.on('chat_message')
    def handle_chat_message(data):
        client_id = None
        for cid, client in clients.items():
            if client['socket_id'] == request.sid:
                client_id = cid
                break
        
        if not client_id:
            return
        
        client = clients[client_id]
        
        # Send message to partner if in a chat
        if client['status'] == 'chatting' and client['partner']:
            partner_id = client['partner']
            if partner_id in clients:
                partner = clients[partner_id]
                
                message = {
                    'type': 'text',
                    'content': data['content'],
                    'sender': client['username'],
                    'timestamp': datetime.now().timestamp() * 1000
                }
                
                # Send to receiver
                emit('chat_message', message, room=partner['socket_id'])
                
                # Confirm to sender
                emit('message_sent', message, room=request.sid)
        
    @socketio.on('end_chat')
    def handle_end_chat():
        client_id = None
        for cid, client in clients.items():
            if client['socket_id'] == request.sid:
                client_id = cid
                break
        
        if not client_id:
            return
        
        client = clients[client_id]
        
        # End chat if in a chat
        if client['status'] == 'chatting' and client['partner']:
            partner_id = client['partner']
            if partner_id in clients:
                partner = clients[partner_id]
                
                emit('chat_ended', {'reason': 'partnerLeft'}, room=partner['socket_id'])
                
                partner['status'] = 'available'
                partner['partner'] = None
            
            client['status'] = 'available'
            client['partner'] = None
            
            emit('chat_ended', {'reason': 'youLeft'}, room=request.sid)
        
    @socketio.on('end_call')
    def handle_end_call():
        client_id = None
        for cid, client in clients.items():
            if client['socket_id'] == request.sid:
                client_id = cid
                break
        
        if not client_id:
            return
        
        client = clients[client_id]
        
        # End call if in a call
        if client['status'] == 'calling' and client['partner']:
            partner_id = client['partner']
            if partner_id in clients:
                partner = clients[partner_id]
                
                emit('call_ended', {'reason': 'partnerLeft'}, room=partner['socket_id'])
                
                partner['status'] = 'available'
                partner['partner'] = None
            
            client['status'] = 'available'
            client['partner'] = None
            
            emit('call_ended', {'reason': 'youLeft'}, room=request.sid)

    return socketio