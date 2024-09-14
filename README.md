# drm_api

## Dorms Review API

To begin development download this repo as a .zip or:

```bash
gh repo clone anpan7088/drm_api
cd drm_api
yarn 
```

Weit installing dependences to finish, then start auto reloading development server:

```bash
nodemon src/app.js
```

For deployment mode run [pm2](https://pm2.keymetrics.io/):

```bash
# Start your application with PM2
pm2 start src/app.js --watch --exp-backoff-restart-delay 10 -f

# Generate and run the startup script
pm2 startup

# Save the PM2 process list
pm2 save

# Verify the setup after reboot
# this is not mandatory
sudo reboot
```

For remote acces API are published on https://dorms.sman.cloud/api whith [nginx](https://nginx.org/)

```nginx
server {
    server_name dorms.sman.cloud;

    # Serve API requests
    location /api/ {
        proxy_pass http://localhost:8088/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_verb;

        rewrite ^/api/(.*)$ /$1 break;
    }

    # Serve React application
    location / {
        root /var/www/html/dist;
        try_files $uri /index.html;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/dorms.sman.cloud/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/dorms.sman.cloud/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = dorms.sman.cloud) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name dorms.sman.cloud;
    return 404; # managed by Certbot
}
```


