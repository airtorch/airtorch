import json
import urllib
import uuid
import requests

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado 
#from tornado import escape, httpclient
from tornado import httpclient
#from tornado.auth import OAuth2Mixin
from tornado.httputil import url_concat

NAMESPACE = "/kela"

class LoginHandler(APIHandler):
    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    def get(self):
        try:
            access_token = self.get_secure_cookie("access_token")
            if not access_token :
                # TODO: store access_token
                print('access token set nahi tha')
                access_token = 'bigmike'
                self.set_secure_cookie("access_token", access_token)
                self.finish(json.dumps({"access": "access token set nahi tha"}))
            else:
                access_token = access_token.decode()
                print('Access token set tha')
                print(access_token)
                #self.finish(json.dumps({
                #"data": "Data is {} /kela/get_example endpoint!".format(data)
                #}))
                self.finish(json.dumps({"access": "access token set tha"}))
        except:
            #nb_fname = ipynbname.name()
            #nb_path = ipynbname.path()
            self.finish(json.dumps({
                "data": "Important file nahi mili"
            }))

    async def post(self):
        try:
            print('yahan to cors k koi issue nahi hai 0')
            self.clear_cookie("access_token")
            input_data = self.get_json_body()
            #check if cookie set or not
            user_email = input_data["email"]
            user_password = input_data["password"]
            data_to_send = {"email": user_email,"password":user_password}
            print('yahan to cors k koi issue nahi hai 1')
            api_url = 'https://localhost:8000/loginAPI'
            response = requests.post(api_url,json=data_to_send,verify=False)
            print('yahan to cors k koi issue nahi hai 2')
            response = response.json()
            sample_dict = {}
            sample_dict['token'] = response['token']
            sample_dict['id'] = response['user']['id']
            #print(json.dumps(sample_dict, indent=1))
            #response = json.loads(response)
            #response_login = json.loads(response.json())
            print('yahan to cors k koi issue nahi hai 3')
            #print(type(response["user"]["id"]))
            #response1 = json.dumps(response)
            #print(json.dumps(response, indent=1))
            #print("response "+response)
            access_token1 = sample_dict["token"]
            user_id1 = str(sample_dict["id"])
            print(sample_dict["id"])
            
            print('access_token  ' + access_token1)
            #user_id1 = user_id1.get('id')
            #print(json.dumps(user_id1.get('id'), indent=1))
            #print('user_id  ' + user_id1)
            print('yahan to cors k koi issue nahi hai 4')
            #response = response["user"].json()
            #user_id1 = json.loads(user_id1)
            #user_id1 = user_id1["id"]
            
            print('yahan to cors k koi issue nahi hai 5')
            print(type(user_id1))
            print(type(access_token1))
            #access_token2 = "*".join([user_id1],[access_token1])
            access_token2 = user_id1+access_token1
            #user_id1 = 4
            print('response json se access_token print karane ki koshish')
            print(access_token2)
            print('response json se user id print karane ki koshish')
            #print(user_id1)            
            self.set_secure_cookie("access_token", access_token2)
            #self.set_secure_cookie("access_token", user_id1)
            #access_token = self.get_secure_cookie("access_token")
            #if not access_token:
                 #self.finish(json.dumps({"access": "access token set nahi tha"}))
            #    print('access_token set nahi tha')
            #else:
            #    access_token = access_token.decode()
            #    print('access_token set tha')
            #    print(access_token)    
            #user_id = self.get_secure_cookie("access_token")
            #if not user_id:
                #self.finish(json.dumps({"access": "access token set nahi tha"}))
            #    print('User id set nahi tha')
            #else:
            #    user_id = user_id.decode()
            #    print('User id set tha')
            #    print(user_id)        
            res = {"code": 200, "message": "Auth was successful"}
            return res
        except:
            res = {"code": 500, "message": "Auth failed" }
            return res


class TorchHandler(APIHandler):
    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    async def post(self):
        try:
            input_data = self.get_json_body()
            #check if cookie set or not
            access_token = self.get_secure_cookie("access_token")
            #user_id = self.get_secure_cookie("user_id")
            if not access_token:
                self.finish(json.dumps({"access": "access token set nahi tha"}))
            else:
                access_token = access_token.decode()
                access_token_id = access_token[2:]
                user_id = access_token[0]
                #user_id = user_id.decode()
                print('Access token set tha')
                print(access_token)
                print('User id token set tha')
                #print(json.dumps(user_id, indent=1))            
                #self.set_secure_cookie("access_token", access_token)
                todo = {"torchName":input_data["variableTorchName"], "variableName": input_data["variableName"],
                "lineCode": input_data["lineCode"],"serverPath": input_data["serverPath"],
                "filePath": input_data["filePath"],"baseUrl": input_data["baseUrl"], "treeUrl": input_data["treeUrl"],
                "creator":user_id}

                api_url = 'https://localhost:8000/api_add_airtorchs/'
                response = requests.post(api_url,json=todo,verify=False,headers={'Authorization': access_token_id})
                response.status_code
        except:
                self.finish(json.dumps({"data": "Exception hit in torch method"}))


# class LoginHandler(APIHandler):
#     # The following decorator should be present on all verb methods (head, get, post,
#     # patch, put, delete, options) to ensure only authorized user can request the
#     # Jupyter server
#     @tornado.web.authenticated
#     def get(self):
#         try:
#             #file = open('important', 'rb')
#             #data = pickle.load(file)
#             #file.close()

#             access_token = self.get_secure_cookie("access_token")
#             if not access_token :
#                 # TODO: store access_token
#                 print('access token set nahi tha')
#                 access_token = 'bigmike'
#                 self.set_secure_cookie("access_token", access_token)
#                 self.finish(json.dumps({"access": "access token set nahi tha"}))
#             else:
#                 access_token = access_token.decode()
#                 print('Access token set tha')
#                 print(access_token)
#                 #self.finish(json.dumps({
#                 #"data": "Data is {} /kela/get_example endpoint!".format(data)
#                 #}))
#                 self.finish(json.dumps({"access": "access token set tha"}))
#         except:
#             #nb_fname = ipynbname.name()
#             #nb_path = ipynbname.path()
#             self.finish(json.dumps({
#                 "data": "Important file nahi mili"
#             }))


# class TorchHandler(APIHandler):
#     # The following decorator should be present on all verb methods (head, get, post,
#     # patch, put, delete, options) to ensure only authorized user can request the
#     # Jupyter server
#     @tornado.web.authenticated
#     async def post(self):
#         input_data = self.get_json_body()
#         #check if cookie set or not
#         access_token = input_data["token"]
#         self.set_secure_cookie("access_token", access_token)

#         todo = {"name":"Big Mike","creator":"2"}
#         api_url = 'https://localhost:8000/api_add_airtorchs/'
#         response = requests.post(api_url,json=todo,verify=False,headers={'Authorization': access_token})

#         response.status_code

def setup_handlers(web_app):
    handlers = [
        ("/login", LoginHandler),
        ("/torch", TorchHandler),
        ]
    host_pattern = ".*$"
    base_url = web_app.settings["base_url"]
    airtorch_handlers = (
        [
            (url_path_join(base_url,NAMESPACE,endpoint),handler)
            for endpoint, handler in handlers
        ]
    )
    #route_pattern = url_path_join(base_url, "kela", "get_example")
    #handlers = [(route_pattern, RouteHandler)]
    web_app.add_handlers(host_pattern, airtorch_handlers)
