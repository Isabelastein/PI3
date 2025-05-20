Este repositório contém o projeto desenvolvido para o Projeto Integrador 3 (PI3) da UNIVESP – Bacharelado em Tecnologia da Informação. 

Para rodar o projeto localmente, é necessário ter algumas ferramentas instaladas. Primeiro, é preciso instalar o Git, que permite clonar o repositório do GitHub. Basta acessar o site oficial (https://git-scm.com), fazer o download e instalar com as opções padrão. Após a instalação, é possível testar se deu certo abrindo o terminal e digitando git --version.

Também é necessário instalar o Node.js, que é o ambiente responsável por rodar o backend da aplicação. A instalação pode ser feita pelo site https://nodejs.org, baixando a versão marcada como “LTS”, que é a mais estável. O Node já vem com o npm, que é o gerenciador de pacotes usado para instalar as dependências do projeto. Após instalar, verifique se deu certo digitando node -v e npm -v no terminal.

Embora opcional, recomenda-se instalar o Visual Studio Code, um editor de código leve e intuitivo que facilita o desenvolvimento e a organização do projeto. Ele pode ser baixado em https://code.visualstudio.com/.

Com as ferramentas instaladas, abra o terminal e siga os seguintes comandos para rodar o projeto:

Primeiro, clone o repositório com o comando git clone https://github.com/Isabelastein/PI3.git. Em seguida, entre na pasta clonada com cd PI3. Depois, execute o comando npm install para instalar as dependências necessárias. Por fim, rode a aplicação com node app.js. Com isso, o servidor será iniciado e o sistema estará disponível no navegador pelo endereço http://localhost:3000.

A estrutura do projeto é simples e organizada: a pasta public/ contém os arquivos públicos como o index.html, responsável pela interface principal da aplicação. O arquivo app.js é o servidor principal da aplicação, onde as rotas e o funcionamento do backend são definidos. Já o arquivo package.json lista todas as dependências utilizadas no projeto, além de conter os scripts de execução. O .gitignore serve para evitar que pastas desnecessárias, como a node_modules, sejam enviadas ao GitHub, mantendo o repositório mais limpo.

Este projeto está em construção contínua, podendo receber melhorias e novas funcionalidades. Para dúvidas, sugestões ou contribuições, sinta-se à vontade para entrar em contato ou abrir uma issue no repositório.
