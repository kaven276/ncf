ELK 数据源

确保安装和服务端相同版本的 nodejs client npm 包
yarn add es7@npm:@elastic/elasticsearch@~7.5

# 通过 docker compose 启动 es8.2.2 后的密码配置

elasticsearch@e4b62e3f7488:~/bin$ /usr/share/elasticsearch/bin/elasticsearch-reset-password -u elastic
WARNING: Owner of file [/usr/share/elasticsearch/config/users] used to be [root], but now is [elasticsearch]
WARNING: Owner of file [/usr/share/elasticsearch/config/users_roles] used to be [root], but now is [elasticsearch]
This tool will reset the password of the [elastic] user to an autogenerated value.
The password will be printed in the console.
Please confirm that you would like to continue [y/N]y


Password for the [elastic] user successfully reset.
New value: W0tgAkRec=g4FTjj97Na
