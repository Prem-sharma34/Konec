from .firebase import firestore_db as db



def add_user(user_id , user_data):
    try:
        db.collection("users").document(user_id).set(user_data)
        return{"success": True, "message": "User added successfully"}
    except Exception as e:
        return {"success": False, "error": str(e)}

def get_user(user_id):
    try:
        user_doc = db.collection("users").document(user_id).get()
        
        if user_doc.exists:
            return {"success": True , "user_data": user_doc.to_dict()}
        else:
            return {"sucesss": False , "message": "User not found"}
    except Exception as e:
        return { "sucess": False , "error": str(e)}