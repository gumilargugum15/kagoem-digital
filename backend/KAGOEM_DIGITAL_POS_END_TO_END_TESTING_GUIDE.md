Kagoem Digital
├── Backend
├── Database
└── Payment/Fulfillment

Kagoem POS SaaS
├── Backend API
├── Database
└── Provisioning API

# Kagoem Digital
KAGOEM_POS_API_URL=http://127.0.0.1:8010/api/v1
KAGOEM_POS_SERVICE_TOKEN=local-dev-provisioning-secret

# kagoem pos saas
KAGOEM_POS_SERVICE_TOKEN=local-dev-provisioning-secret

cd /var/www/kagoem-pos-saas
php artisan serve --port=8010