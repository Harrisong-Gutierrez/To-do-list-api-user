(function () {
    const module = {
  
      url: 'https://todos.simpleapi.dev/api/users',
      apiKey: '362dec4d-cc18-4ef2-bc02-695ebac41750',
      urlTodo: '/',
      urlSignUp: "/pages/signup.html",
      urlLogIn: "/pages/login.html",
  
      cacheDom: function () {
        this.formContainer = document.getElementById('form-container');
        this.form = document.getElementById('form-id');
        this.input = document.getElementById('input-id');
        this.addButton = document.getElementById('submit-button-id-icon');
        this.icon = document.getElementById('icon-id');
        this.toggle = document.getElementById('toggle');
        this.labelToggle = document.getElementById('label_toggle');
        this.headerBox = document.getElementById('header-box');
        this.mainBox = document.getElementById('container-to-do-list');
        this.taskCounter = document.getElementById('counter');
        this.list = document.getElementById('list-to-do');
        this.signUpForm = document.getElementById('signup-form');
        this.logInForm = document.getElementById('log-in-form');
        this.logOutForm = document.getElementById('Logout-form')
        this.nameContainer = document.getElementById('nombre-container');
  
      },
  
      main: function () {
  
        document.addEventListener('DOMContentLoaded', () => {
          switch (window.location.pathname) {
  
            case this.urlLogIn:
              this.cacheDom();
              this.bindEvents();
              break;
  
            case this.urlSignUp:
              this.cacheDom();
              this.bindEvents();
              break;
  
            case this.urlTodo:
  
              this.user = JSON.parse(localStorage.getItem('UserState'));
              this.tasks = [];
              this.cacheDom();
              this.loadTasksFromAPI();
              this.bindEvents();
              this.updateTaskCounter();
              this.toggle.checked = localStorage.getItem('darkMode') === 'true';
              this.toggleDarkMode();
              break;
          };
        });
      },
  
      submitSignUpForm: async function (event) {
        event.preventDefault();
  
        const firstName = document.getElementById('InputName').value;
        const email = document.getElementById('InputEmail').value;
        const password = document.getElementById('InputPassword').value;
  
        const agreedToTerms = document.getElementById('Check').checked;
  
        if (!agreedToTerms) {
          alert("Please agree to the terms and conditions before signing up.");
          return;
        }
  
        if (!firstName || !email || !password) {
          alert("Please fill out all the fields.");
          return;
        }
  
        const newUser = {
          "email": email,
          "name": firstName,
          "password": password
        };
  
        try {
  
          const response = await axios.post(`${this.url}/register?apikey=${this.apiKey}`, newUser);
  
          if (response.status === 200) {
            alert("Sign-up successful! You can now log in with your credentials.");
  
            window.location.href = "../pages/login.html";
          }
  
        } catch (error) {
  
          alert("Error signing up. Please try again later.");
        
        }
      },
  
      submitLogInForm: async function (event) {
        event.preventDefault();
  
        const email = document.getElementById('LogInputEmail1').value;
        const password = document.getElementById('LogInputPassword').value;
  
        if (!email || !password) {
          alert("Please fill out all the fields.");
          return;
        }
  
        const dataUser = {
          "email": email,
          "password": password
        };
  
        try {
  
          const { data, status } = await axios.post(`${this.url}/login?apikey=${this.apiKey}`, dataUser);
  
          if (status === 200) {
            alert("Log-in successful! You can now edit your To Do List.");
  
            localStorage.setItem('UserState', JSON.stringify(data));
  
            window.location.href = this.urlTodo;
  
          } else {
            window.alert("There was an error in the connection.")
          }
        } catch (error) {
  
          alert("There was an error trying to log in. Please try again later");
         
        }
      },
  
      submitLogOutForm: async function (event) {
        event.preventDefault();
  
        try {
  
          const { status } = await axios.post(`${this.url}/logout?apikey=${this.apiKey}`, null, {
            headers: {
              'Authorization': `Bearer ${this.user.token}`
            }
          });
  
          if (status === 200) {
            alert("Log-out successful!");
  
            window.location.href = this.urlLogIn;
          } else {
            window.alert("There was an error in the connection.")
          }
        } catch (error) {
  
          alert("There was an error trying to log in. Please try again later");
         
        }
  
      },
  
      createItems: function (todo) {
        const buttonsDiv = document.createElement('div');
        const editButton = document.createElement('button');
        const deleteButton = document.createElement('button');
        const listItem = document.createElement('li');
        const checkboxDiv = document.createElement('div');
        const label = document.createElement('label');
        const checkbox = document.createElement('div');
  
        listItem.id = `list-item-${todo.id}`;
        listItem.className = `BodyMain-list-custom d-flex justify-content-between align-items-center`;
  
        checkboxDiv.className = 'BodyMain-checkbox';
        checkbox.className = `fa-sharp fa-solid fa-circle-check BodyMain-radio-task`;
        checkbox.id = `task-${todo.id}`;
  
        checkboxDiv.appendChild(checkbox);
  
        label.htmlFor = `task-${todo.id}`;
        label.textContent = todo.description;
        label.className = 'BodyMain-label-task';
        label.style.textDecoration = todo.completed ? 'line-through' : 'none';
  
        checkbox.addEventListener('click', () => {
          todo.completed = !todo.completed;
          label.style.textDecoration = todo.completed ? 'line-through' : 'none';
          this.editCheckBox(todo.id, todo.completed, label.textContent)
        });
  
        checkboxDiv.appendChild(label);
        listItem.appendChild(checkboxDiv);
  
        buttonsDiv.className = 'BodyMain-buttons';
  
        editButton.className = 'BodyMain-button-edit BodyMain-task-buttons btn btn-outline-primary btn-sm mr-2';
        editButton.innerHTML = '<i class="BodyMain-icon-edit fas fa-edit"></i>';
        buttonsDiv.appendChild(editButton);
  
        deleteButton.className = 'BodyMain-button-delete BodyMain-task-buttons btn btn-outline-danger btn-sm';
        deleteButton.innerHTML = '<i class="BodyMain-icon-trash fas fa-trash"></i>';
        buttonsDiv.appendChild(deleteButton);
  
        listItem.appendChild(buttonsDiv);
        this.list.appendChild(listItem);
  
        editButton.addEventListener('click', () => this.editTask(todo, todo.id));
        deleteButton.addEventListener('click', () => this.deleteTask(todo.id));
      },
  
      updateTaskCounter: function () {
        this.taskCounter.textContent = this.tasks.length;
      },
  
      addTaskToList: async function (task) {
        try {
          const newTask = {
            "description": task,
            "completed": false,
            "meta": {}
          };
  
          const { data, status } = await axios.post(`${this.url}/${this.user.id}/todos?apikey=${this.apiKey}`, newTask, {
            headers: {
              'Authorization': `Bearer ${this.user.token}`
            }
          });
  
          if (status === 200) {
  
            this.tasks.push(data);
            this.createItems(data);
            this.applyItemStyle();
            this.updateTaskCounter();
            window.alert('The task has been added successfully');
  
  
  
          } else {
            window.alert('There was an error in the request');
          }
  
        } catch (error) {
          window.alert(error);
        }
      },
  
      loadTasksFromAPI: async function () {
  
        try {
  
          this.nameContainer.textContent = `${this.user.name}`;
  
          const { data, status } = await axios.get(`${this.url}/${this.user.id}/todos?apikey=${this.apiKey}`, {
            headers: {
              'Authorization': `Bearer ${this.user.token}`
            }
          });
  
          
          if (status === 200) {
            this.list.innerHTML = '';
            this.tasks = data || [];
            this.tasks.forEach((task) => {
              this.createItems(task);
              
            });
            this.applyItemStyle();
            this.updateTaskCounter();
          } else {
            window.alert('There was an error in the request')
          }
        } catch (error) {
          window.alert(error);
        }
      },
  
      updateListItem: function (listItem, task) {
        const label = listItem.querySelector('label');
        label.textContent = task.text;
        label.style.display = 'flex';
      },
  
      editCheckBox: async function (id, isChecked, textTask, taskId) {
  
        try {
          const updatedTask = {
            "description": textTask,
            "completed": isChecked,
            "meta": {}
          };
  
          const { data, status } = await axios.put(`${this.url}/${this.user.id}/todos/${id}?apikey=${this.apiKey}`, updatedTask, {
            headers: {
              'Authorization': `Bearer ${this.user.token}`
            }
          });
  
  
          if (status === 200) {
            const index = this.tasks.findIndex(task => task.id == id);
            this.tasks[index] = { ...updatedTask };
          } else {
            window.alert('There was an error in the request');
          }
        } catch (error) {
          window.alert(error);
        }
  
      },
  
      editTask: async function (task, taskId) {
        const listItem = document.getElementById(`list-item-${taskId}`);
        if (!listItem) return;
  
        const label = listItem.querySelector('label');
        const inputEdit = document.createElement('input');
        const updateButton = document.createElement('button');
  
        const existingInput = listItem.querySelector('.BodyMain-input-edit-task');
        const existingButton = listItem.querySelector('.BodyMain-button-update-task');
  
        if (existingInput || existingButton) return;
  
        inputEdit.type = 'text';
        inputEdit.value = task.description;
        inputEdit.className = 'BodyMain-input-edit-task';
  
        updateButton.className = 'BodyMain-button-update-task';
        updateButton.textContent = 'Update';
  
        const editFormContainer = document.createElement('div');
        editFormContainer.className = 'BodyMain-form-task';
  
        editFormContainer.appendChild(inputEdit);
        editFormContainer.appendChild(updateButton);
  
        const parentElement = label.parentNode;
        parentElement.insertBefore(editFormContainer, label.nextSibling);
  
        label.style.display = 'none';
        listItem.querySelector('.BodyMain-buttons').style.display = 'none';
  
        const saveChanges = async () => {
          const updatedTaskDescription = inputEdit.value.trim();
          if (updatedTaskDescription !== '') {
            try {
              const updatedTask = {
                "description": updatedTaskDescription,
                "completed": task.completed,
                "meta": {},
              };
  
              const { data, status } = await axios.put(`${this.url}/${this.user.id}/todos/${taskId}?apikey=${this.apiKey}`, updatedTask, {
                headers: {
                  'Authorization': `Bearer ${this.user.token}`
                }
              });
  
              if (status === 200) {
                task.description = data.description;
                label.textContent = data.description;
                window.alert('The task has been edited successfully');
              } else {
                window.alert('There was an error in the request');
              }
            } catch (error) {
              window.alert(error);
            }
          }
  
          label.style.display = 'flex';
          listItem.querySelector('.BodyMain-buttons').style.display = 'flex';
          inputEdit.remove();
          updateButton.remove();
        };
  
        inputEdit.addEventListener('keydown', async (event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            saveChanges();
          }
        });
  
        updateButton.addEventListener('click', async () => {
          saveChanges();
        });
  
        inputEdit.addEventListener('blur', () => {
          saveChanges();
        });
      },
  
      deleteTask: async function (taskId) {
        try {
  
          const { status } = await axios.get(`${this.url}/${this.user.id}/todos?apikey=${this.apiKey}`, {
            headers: {
              'Authorization': `Bearer ${this.user.token}`
            }
          });
  
          if (status === 200) {
            const listItem = document.getElementById(`list-item-${taskId}`);
            if (listItem) {
              const parentList = listItem.parentNode;
              parentList.removeChild(listItem);
              this.tasks = this.tasks.filter((task) => task.id !== taskId);
              this.applyItemStyle();
              this.updateTaskCounter();
              window.alert("The task has been deleted successfully")
            }
          } else {
            window.alert('There was an error in the connection.')
          }
        } catch (error) {
          window.alert(error);
        }
      },
  
      applyItemStyle: function () {
        const taskListItems = this.list.querySelectorAll('li');
  
        taskListItems.forEach((item, index) => {
  
          const currentIsDark = index % 2 === 0;
  
          item.classList.remove(this.toggle.checked ? 'BodyMain-list-custom-light' : 'BodyMain-list-custom-dark');
          item.classList.add(`BodyMain-list-custom-${this.toggle.checked ? 'dark' : 'light'}`);
  
          const bgColor = this.toggle.checked
            ? currentIsDark ? 'var(--background-table-dark-secundary)' : 'var(--background-table-dark-primary)'
            : currentIsDark ? 'var(--background-table-light-secundary)' : 'var(--background-table-light-principal)';
  
          item.style.backgroundColor = bgColor;
          item.style.color = `var(--text-${this.toggle.checked ? 'white' : 'black'}-list)`;
        });
      },
  
      bindEvents: function () {
  
        switch (window.location.pathname) {
          case this.urlLogIn:
  
            this.logInForm.addEventListener('submit', this.submitLogInForm.bind(this))
  
            break;
  
          case this.urlSignUp:
  
            this.signUpForm.addEventListener('submit', this.submitSignUpForm.bind(this));
  
            break;
  
          case this.urlTodo:
            window.addEventListener('DOMContentLoaded', () => {
              const savedDarkMode = localStorage.getItem('darkMode');
  
              this.toggle.checked = savedDarkMode === 'true';
            });
  
            this.addButton.addEventListener('click', (event) => {
              event.preventDefault();
              const inputValue = this.input.value.trim();
  
              if (inputValue !== '') {
                this.addTaskToList(inputValue);
                this.input.value = ''
              }
            });
  
            this.input.addEventListener('keydown', (event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                const inputValue = this.input.value.trim();
                if (inputValue !== '') {
                  this.addTaskToList(inputValue);
                  this.input.value = '';
                }
              }
            });
  
            this.toggle.addEventListener('change', (event) => {
              const checked = event.target.checked;
  
              this.toggleDarkMode();
              localStorage.setItem('darkMode', checked.toString());
            });
  
  
            this.logOutForm.addEventListener('click', this.submitLogOutForm.bind(this))
  
            break;
        };
      },
  
      toggleDarkMode: function () {
        const isDarkModeEnabled = this.toggle.checked;
        const bodyClassList = document.body.classList;
        const mainBoxClassList = this.mainBox.classList;
        const headerBoxClassList = this.headerBox.classList;
  
        if (isDarkModeEnabled) {
  
          bodyClassList.add('BodyMainDark');
          mainBoxClassList.add('BodyMainDark-dark-main-box');
          headerBoxClassList.add('BodyMainDark-header-box');
        } else {
  
          bodyClassList.remove('BodyMainDark');
          mainBoxClassList.remove('BodyMainDark-dark-main-box');
          headerBoxClassList.remove('BodyMainDark-header-box');
        }
  
        this.applyItemStyle();
  
        this.labelToggle.innerHTML = isDarkModeEnabled ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        this.labelToggle.style.color = isDarkModeEnabled ? 'var(--orenge-sun)' : 'var(--purple-moon)';
  
        localStorage.setItem('darkMode', isDarkModeEnabled.toString());
      },
    };
  
    module.main();
  })();
  