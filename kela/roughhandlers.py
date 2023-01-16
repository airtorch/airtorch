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
        input_data = self.get_json_body()
        #check if cookie set or not
        user_email = input_data["email"]
        user_password = input_data["password"]
        data_to_send = {"email": user_email,"password":user_password}
        api_url = 'https://localhost:8000/loginAPI/'
        response = requests.post(api_url,json=data_to_send,verify=False)
        response = response.json()
        self.set_secure_cookie("access_token", response["token"])
        response.status_code        


class TorchHandler(APIHandler):
    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    async def post(self):
        input_data = self.get_json_body()
        #check if cookie set or not
        access_token = input_data["token"]
        self.set_secure_cookie("access_token", access_token)

        todo = {"name":"Big Mike","creator":"2"}
        api_url = 'https://localhost:8000/api_add_airtorchs/'
        response = requests.post(api_url,json=todo,verify=False,headers={'Authorization': access_token})

        response.status_code

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
