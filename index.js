const express = require("express")
const swaggerUi = require("swagger-ui-express")
const swaggerJsdoc = require("swagger-jsdoc")
const swaggerOptions = require("./extend/swagger")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

const JWT_SECRET = "secretinho"

const app = express()
const port = 3000 

const specs = swaggerJsdoc(swaggerOptions)

app.use(express.json())

const authenticateToken =(req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split('')[1]

    if(!token){
        res.status(401).json({"message": "Token obrigatório"})
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err){ 
            return res.status(403).json({"message": "Token inválido"})
        }
        req.user = user
        next()
    })
}

/**
 * @swagger
 * components:
 *  schemas:
 *      Aluno:
 *          type: object
 *          require:
 *              - id
 *              - nome
 *          properties:
 *              id:
 *                  type: integer
 *                  description: Identificador unico do aluno
 *              nome:
 *                  type: string
 *                  description: Nome do aluno
 *              example:
 *                  id: 1
 *                  nome: fulano
 */

let alunos = [
    {id: 1 , nome: "Julia"}
]

let usuario = []

/** 
 * @swagger 
 * /aluno:
 *  get:
 *      summary: Retorna todos os alunos cadastrados
 *      tags: [Aluno]
 *      responses: 
 *          200:
 *              description: Lista de Alunos
 *              content:
 *                  application/json:
 *                      schema: 
 *                          type: array 
 *                          items: 
 *                              $ref: '#/components/schemas/Aluno'
 */
app.get('/aluno', authenticateToken,(req, res)=> {
    res.json(alunos)
})

/** 
 * @swagger 
 * /aluno:
 *      post:
 *          summary: Criar uma novo aluno
 *          tags: [Aluno]
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties: 
 *                              nome:
 *                                  type: string 
 *          responses: 
 *          201:
 *              description: Aluno criado
 *              content:
 *                  application/json:
 *                      schema: 
 *                          $ref:'#/components/schemas/Aluno'
 */

app.post('/aluno', authenticateToken,(req, res) =>{
    const novoAluno = { id: alunos.length + 1, ...req.body}
    alunos.push(novoAluno)
    res.status(201).json(novoAluno)
})

app.put('/aluno/:id', authenticateToken,(req,res) =>{
    const { id } = req.params
    const alunoIndex = alunos.findIndex(a=> a.id ==id)

    if(alunoIndex > -1) {
        alunos[alunoIndex] = { id:Number (id), ...req.body}
        res.status(200).json(alunos[alunoIndex])
    } else{
        res.status(404).json({message: "Aluno não encontrado"})
    }
})
/**  
* @swagger
 * /auth/register:
 *   post:
 *     summary: Registra novo usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:  
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Usuário já existe
 */

app.post('/auth/register', async (req, res) => {
    const {nome, email, senha} = req.body;

    const usuarioExistente = usuario.find(u => u.email === email)
    if (usuarioExistente){
        return res.status(400).json({"message": "Email já cadastrado"})
    }

    const senhaHash = await bcrypt.hash(senha, 10)
    const novoUsuario = {
        id: usuario.length + 1,
        nome, 
        email,
        senha: senhaHash
    }

    usuario.push(novoUsuario)
    res.status(201).json({"message": "Usuario criado com sucesso :D"})
})

 /** 
* @swagger
 * /auth/login:
 *   post:
 *     summary: Realiza login do usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 usuario:
 *                   type: object
 *       401:
 *         description: Credenciais inválidas
 */

app.post('/auth/login', async (req, res) => {
    const {email, senha} = req.body

    const usuarioExistente = usuario.find(u => u.email === email)
    const senhaValida = await bcrypt.compare (senha,usuarioExistente.senha)

    if(!senhaValida){
        return res.status(401).json({"message": "Credenciais Inválidas"})
    }

    const token = jwt.sign(
        { id: usuarioExistente.id, nome:usuarioExistente.nome, email: usuarioExistente.email},
        JWT_SECRET, 
        { expiresIn: '1h'}
    )
    res.json({token})
})                      


app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(specs))

app.listen(port, () => {
    console.log("Servidor De API Funcionando")
})

