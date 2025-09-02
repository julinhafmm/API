const swaggerOptions = {
    definition: {
        openapi: '3.0.0', 
        info : {
            title: 'API de alunos',
            version: '1.0.0',
            description: 'API para gerenciamento de alunos'
        },
        components:{
            securitySchemes : {
                bearerAuth:{
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security:[{
            bearerAuth:[]
        }],
        servers:[
            {
                url: 'http://localhost:3000',
                description: 'Servidor local de desenvolvimento'
            }
        ]
    }, 
    apis: ['./index.js']
}

module.exports = swaggerOptions