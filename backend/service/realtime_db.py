from .firebase import realtime_db


def create_user(user_id , user_data):
    user_ref = realtime_db.child("users").child(user_id)
    user_ref.set(user_data)
    return {"messsage": "user created successfully"}
    
def get_user(user_id):
    user_ref = realtime_db.child("users").child(user_id)
    user_data = user_ref.get()
    return user_data if user_data else {"message": "user not found"}

def update_user(user_id, updates):
    user_ref = realtime_db.child("users").child(user_id)
    user_ref.update(updates)
    return {"message": "user updated successfully"}


def delete_user(user_id):
    user_ref = realtime_db.child("users").child(user_id)
    user_ref.delete()
    return {"message": "user deleted successfully"}