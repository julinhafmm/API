const express = require("express")
const app = express()
const port = 3000 

app.use(express.json())

let alunos = [
    {id: 1 , nome: "Julia"}
]

app.get('/aluno', (req, res)=> {
    res.json(alunos)
})


app.post('/aluno', (req, res) =>{
    const novoAluno = { id: alunos.length + 1, ...req.body}
    alunos.push(novoAluno)
    res.status(201).json(novoAluno)
})


app.listen(port, () => {
    console.log("Servidor De API Funcionando")
})