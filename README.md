# Projeto Integrador 3 (PI3) – UNIVESP

Este repositório contém o projeto desenvolvido para o **Projeto Integrador 3 (PI3)** da **UNIVESP – Bacharelado em Tecnologia da Informação**

Para rodar o projeto localmente, é necessário ter algumas ferramentas instaladas. Primeiro, é preciso instalar o Git, que permite clonar o repositório do GitHub. Basta acessar o site oficial (https://git-scm.com), fazer o download e instalar com as opções padrão. Após a instalação, é possível testar se deu certo abrindo o terminal e digitando git --version.

Também é necessário instalar o Node.js, que é o ambiente responsável por rodar o backend da aplicação. A instalação pode ser feita pelo site https://nodejs.org, baixando a versão marcada como “LTS”, que é a mais estável. O Node já vem com o npm, que é o gerenciador de pacotes usado para instalar as dependências do projeto. Após instalar, verifique se deu certo digitando node -v e npm -v no terminal.

Embora opcional, recomenda-se instalar o Visual Studio Code, um editor de código leve e intuitivo que facilita o desenvolvimento e a organização do projeto. Ele pode ser baixado em https://code.visualstudio.com/.

Com as ferramentas instaladas, abra o terminal e siga os seguintes comandos para rodar o projeto:

Primeiro, clone o repositório com o comando git clone https://github.com/Isabelastein/PI3.git. Em seguida, entre na pasta clonada com cd PI3. Depois, execute o comando npm install para instalar as dependências necessárias. Por fim, rode a aplicação com node app.js. Com isso, o servidor será iniciado e o sistema estará disponível no navegador pelo endereço http://localhost:3000.

## 💡 Sobre o Projeto

A proposta deste projeto é desenvolver um **website interativo** que funcione como um canal oficial de comunicação de uma figura pública ou empreendedor. O objetivo é **centralizar informações** que hoje estão dispersas em diferentes redes sociais, facilitando o acesso e ampliando a presença digital.

A ideia surgiu da necessidade de fortalecer a atuação digital de quem já está presente nas redes sociais, mas encontra dificuldades para reunir e divulgar seus conteúdos de forma estruturada. 

## 🗂 Estrutura do Projeto

A estrutura do projeto é simples, clara e organizada:

- `public/`: Contém os arquivos públicos, incluindo:
  - `index.html`: Interface principal do site
  - `login.html`, `registro.html`, `app.html`: Outras interfaces da aplicação
- `app.js`: Servidor principal responsável pelas rotas e funcionamento do backend.
- `package.json`: Lista de dependências e scripts do projeto.
- `.gitignore`: Arquivo para ignorar pastas como `node_modules/`, evitando poluir o repositório.

## 🚧 Status do Projeto

O projeto encontra-se **praticamente finalizado**, restando apenas sua publicação em ambiente de nuvem, conforme os requisitos de entrega do PI3.

