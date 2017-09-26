# BIOT_client
blockchain for Iot security - client side

IoT devices are decentralized, scalable, low power so It is hard to apply
security method which used in now. Since , centralized and demend high power
So, This project aim to make security system fit in IoT Network

###about this project
 IoT security system base on blockchain and vpn.
This project is compose of server and client.
Client play role like node or device.
First, connect to vpn network and then server(=block server)
Second, client just register transaction and send transaction to server

###feature




###dependency

**openVPN**


###Installation

    git clone https://github.com/skawhdgjs/BIOT_client.git

### config
before you start, you modify config file

config define in **/lib/devcieConfig.json**

properties     | descrption
-------- | ---
Id | client Id(base on client key name created on vpn server)
server    | block server url
webSocket     | web page port what for command



###start

	npm start




###commnad

**addTransaction**

register Transaction

**deleteTransaction**

delete Transaction


###contributor

Nam Jong Heon skawhdgjs@naver.com
Jong Dong won dongwonism@naver.com
