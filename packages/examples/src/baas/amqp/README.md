# 通过 docker 安装 rabbitmq

docker pull rabbitmq:management
docker run -d -p 15672:15672 -p 5672:5672 -e RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_DEFAULT_PASS=admin --name rabbitmq rabbitmq:management
http://localhost:15672 访问管理界面
