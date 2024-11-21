// Initialize admin account
if (!localStorage.getItem('admin')) {
    localStorage.setItem('admin', JSON.stringify({
        username: 'Daksh',
        password: 'Admin123',
        isAdmin: true
    }));
}

// Initialize arrays
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([]));
}
if (!localStorage.getItem('transactions')) {
    localStorage.setItem('transactions', JSON.stringify([]));
}

let currentUser = null;
let isAdminLoggedIn = false;

// Navigation Functions
function showHome() {
    document.getElementById('home').style.display = 'block';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('adminLoginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'none';
}

function showLogin() {
    document.getElementById('home').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('adminLoginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'none';
}

function showAdminLogin() {
    document.getElementById('home').style.display = 'none';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('adminLoginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'none';
}

function showRegister() {
    document.getElementById('home').style.display = 'none';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('adminLoginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'none';
}

function showDashboard() {
    if (!currentUser) return;
    document.getElementById('home').style.display = 'none';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('adminLoginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('adminDashboard').style.display = 'none';
    updateDashboard();
}

function showAdminDashboard() {
    document.getElementById('home').style.display = 'none';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('adminLoginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    updateAdminDashboard();
}

// User Functions
function generateAccountNumber() {
    return 'DB' + new Date().getFullYear() + Math.floor(Math.random() * 100000);
}

function register() {
    const name = document.getElementById('regName').value;
    const dob = document.getElementById('regDob').value;
    const email = document.getElementById('regEmail').value;
    const mobile = document.getElementById('regMobile').value;
    const address = document.getElementById('regAddress').value;
    const password = document.getElementById('regPassword').value;
    const initialDeposit = parseFloat(document.getElementById('regDeposit').value);

    if (!name || !dob || !email || !mobile || !address || !password || !initialDeposit) {
        document.getElementById('registerMessage').textContent = 'Please fill all fields';
        return;
    }

    if (initialDeposit < 1000) {
        document.getElementById('registerMessage').textContent = 'Initial deposit must be at least ₹1000';
        return;
    }

    const accountNumber = generateAccountNumber();
    const user = {
        name,
        dob,
        email,
        mobile,
        address,
        password,
        accountNumber,
        balance: initialDeposit,
        status: 'Active'
    };

    // Get existing users and add new user
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));

    // Record initial deposit transaction
    const transaction = {
        accountNumber,
        date: new Date().toISOString(),
        type: 'deposit',
        amount: initialDeposit,
        balance: initialDeposit
    };
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    document.getElementById('registerMessage').textContent = `Account created successfully! Your account number is ${accountNumber}`;
    setTimeout(() => showLogin(), 3000);
}

function login() {
    const accountNumber = document.getElementById('loginAccountNumber').value;
    const password = document.getElementById('loginPassword').value;

    if (!accountNumber || !password) {
        document.getElementById('loginMessage').textContent = 'Please enter both account number and password';
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.accountNumber === accountNumber && u.password === password);

    if (user) {
        if (user.status === 'Inactive') {
            document.getElementById('loginMessage').textContent = 'Account is currently inactive';
            return;
        }

        currentUser = user;
        document.getElementById('loginMessage').textContent = 'Login successful!';
        document.getElementById('dashboardLink').style.display = 'block';
        document.getElementById('logoutLink').style.display = 'block';
        showDashboard();
    } else {
        document.getElementById('loginMessage').textContent = 'Invalid account number or password';
    }
}

function adminLogin() {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    const admin = JSON.parse(localStorage.getItem('admin'));
    if (username === admin.username && password === admin.password) {
        isAdminLoggedIn = true;
        document.getElementById('adminLoginMessage').textContent = 'Admin login successful!';
        showAdminDashboard();
    } else {
        document.getElementById('adminLoginMessage').textContent = 'Invalid admin credentials';
    }
}

function logout() {
    currentUser = null;
    document.getElementById('dashboardLink').style.display = 'none';
    document.getElementById('logoutLink').style.display = 'none';
    showHome();
}

function adminLogout() {
    isAdminLoggedIn = false;
    document.getElementById('adminDashboard').style.display = 'none';
    showHome();
}

function updateDashboard() {
    if (!currentUser) return;

    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('accountNumber').textContent = currentUser.accountNumber;
    document.getElementById('balance').textContent = currentUser.balance.toFixed(2);

    // Update transaction history
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const userTransactions = transactions.filter(t => t.accountNumber === currentUser.accountNumber);
    const transactionTable = document.getElementById('transactionTable');
    transactionTable.innerHTML = '';

    userTransactions.reverse().forEach(transaction => {
        const row = transactionTable.insertRow();
        row.insertCell(0).textContent = new Date(transaction.date).toLocaleDateString();
        row.insertCell(1).textContent = transaction.type;
        row.insertCell(2).textContent = `₹${transaction.amount.toFixed(2)}`;
        row.insertCell(3).textContent = `₹${transaction.balance.toFixed(2)}`;
    });
}

function updateAdminDashboard() {
    if (!isAdminLoggedIn) return;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userTable = document.getElementById('adminUserTable');
    userTable.innerHTML = `
        <tr>
            <th>Account Number</th>
            <th>Name</th>
            <th>Email</th>
            <th>Balance</th>
            <th>Status</th>
            <th>Actions</th>
        </tr>
    `;

    users.forEach(user => {
        const row = userTable.insertRow();
        row.innerHTML = `
            <td>${user.accountNumber}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>₹${user.balance.toFixed(2)}</td>
            <td>${user.status || 'Active'}</td>
            <td>
                <button onclick="toggleAccountStatus('${user.accountNumber}')">${user.status === 'Inactive' ? 'Activate' : 'Deactivate'}</button>
                <button onclick="deleteAccount('${user.accountNumber}')">Delete</button>
                <button onclick="showManageAccount('${user.accountNumber}')">Manage</button>
            </td>
        `;
    });
}

function toggleAccountStatus(accountNumber) {
    const users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.accountNumber === accountNumber);
    
    if (userIndex !== -1) {
        users[userIndex].status = users[userIndex].status === 'Inactive' ? 'Active' : 'Inactive';
        localStorage.setItem('users', JSON.stringify(users));
        updateAdminDashboard();
    }
}

function deleteAccount(accountNumber) {
    if (confirm('Are you sure you want to delete this account?')) {
        let users = JSON.parse(localStorage.getItem('users'));
        users = users.filter(u => u.accountNumber !== accountNumber);
        localStorage.setItem('users', JSON.stringify(users));
        updateAdminDashboard();
    }
}

function showManageAccount(accountNumber) {
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.accountNumber === accountNumber);
    
    if (user) {
        document.getElementById('manageAccountForm').style.display = 'block';
        document.getElementById('manageAccountNumber').value = user.accountNumber;
        document.getElementById('manageBalance').value = user.balance;
    }
}

function closeManageForm() {
    document.getElementById('manageAccountForm').style.display = 'none';
}

function transferMoney() {
    const recipientAccount = document.getElementById('transferAccount').value;
    const amount = parseFloat(document.getElementById('transferAmount').value);

    if (!recipientAccount || !amount) {
        document.getElementById('transferMessage').textContent = 'Please enter recipient account and amount';
        return;
    }

    if (amount <= 0) {
        document.getElementById('transferMessage').textContent = 'Please enter a valid amount';
        return;
    }

    if (amount > currentUser.balance) {
        document.getElementById('transferMessage').textContent = 'Insufficient balance';
        return;
    }

    const users = JSON.parse(localStorage.getItem('users'));
    const recipientIndex = users.findIndex(u => u.accountNumber === recipientAccount);

    if (recipientIndex === -1) {
        document.getElementById('transferMessage').textContent = 'Recipient account not found';
        return;
    }

    if (recipientAccount === currentUser.accountNumber) {
        document.getElementById('transferMessage').textContent = 'Cannot transfer to your own account';
        return;
    }

    // Update balances
    const senderIndex = users.findIndex(u => u.accountNumber === currentUser.accountNumber);
    users[senderIndex].balance -= amount;
    users[recipientIndex].balance += amount;
    localStorage.setItem('users', JSON.stringify(users));
    currentUser = users[senderIndex];

    // Record transactions
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const timestamp = new Date().toISOString();
    
    // Sender's transaction
    transactions.push({
        accountNumber: currentUser.accountNumber,
        date: timestamp,
        type: 'transfer-sent',
        amount: -amount,
        balance: currentUser.balance
    });

    // Recipient's transaction
    transactions.push({
        accountNumber: recipientAccount,
        date: timestamp,
        type: 'transfer-received',
        amount: amount,
        balance: users[recipientIndex].balance
    });

    localStorage.setItem('transactions', JSON.stringify(transactions));

    document.getElementById('transferMessage').textContent = 'Transfer successful!';
    document.getElementById('transferAccount').value = '';
    document.getElementById('transferAmount').value = '';
    updateDashboard();
}

function adminDeposit() {
    const accountNumber = document.getElementById('manageAccountNumber').value;
    const amount = parseFloat(document.getElementById('adminDepositAmount').value);

    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.accountNumber === accountNumber);

    if (userIndex !== -1) {
        users[userIndex].balance += amount;
        localStorage.setItem('users', JSON.stringify(users));

        // Record transaction
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        transactions.push({
            accountNumber,
            date: new Date().toISOString(),
            type: 'admin-deposit',
            amount: amount,
            balance: users[userIndex].balance
        });
        localStorage.setItem('transactions', JSON.stringify(transactions));

        updateAdminDashboard();
        alert('Deposit successful');
        closeManageForm();
    }
}

function adminWithdraw() {
    const accountNumber = document.getElementById('manageAccountNumber').value;
    const amount = parseFloat(document.getElementById('adminWithdrawAmount').value);

    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.accountNumber === accountNumber);

    if (userIndex !== -1) {
        if (users[userIndex].balance < amount) {
            alert('Insufficient balance');
            return;
        }

        users[userIndex].balance -= amount;
        localStorage.setItem('users', JSON.stringify(users));

        // Record transaction
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        transactions.push({
            accountNumber,
            date: new Date().toISOString(),
            type: 'admin-withdrawal',
            amount: -amount,
            balance: users[userIndex].balance
        });
        localStorage.setItem('transactions', JSON.stringify(transactions));

        updateAdminDashboard();
        alert('Withdrawal successful');
        closeManageForm();
    }
}





// Add these functions to the existing script.js

function updateUserStatistics() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'Active').length;
    const totalBalance = users.reduce((sum, user) => sum + user.balance, 0);

    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('activeUsers').textContent = activeUsers;
    document.getElementById('totalBalance').textContent = totalBalance.toFixed(2);
}

function searchUsers() {
    const searchTerm = document.getElementById('searchUser').value.toLowerCase();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm) || 
        user.accountNumber.toLowerCase().includes(searchTerm)
    );

    const userTable = document.getElementById('adminUserTable');
    userTable.innerHTML = `
        <tr>
            <th>Account Number</th>
            <th>Name</th>
            <th>Email</th>
            <th>Balance</th>
            <th>Status</th>
            <th>Actions</th>
        </tr>
    `;

    filteredUsers.forEach(user => {
        const row = userTable.insertRow();
        row.innerHTML = `
            <td>${user.accountNumber}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>₹${user.balance.toFixed(2)}</td>
            <td>${user.status || 'Active'}</td>
            <td>
                <button onclick="toggleAccountStatus('${user.accountNumber}')">${user.status === 'Inactive' ? 'Activate' : 'Deactivate'}</button>
                <button onclick="deleteAccount('${user.accountNumber}')">Delete</button>
                <button onclick="showManageAccount('${user.accountNumber}')">Manage</button>
                <button onclick="downloadAccountStatement('${user.accountNumber}')">Statement</button>
            </td>
        `;
    });
}

function downloadAccountStatement(accountNumber) {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const userTransactions = transactions.filter(t => t.accountNumber === accountNumber);
    const user = JSON.parse(localStorage.getItem('users') || '[]').find(u => u.accountNumber === accountNumber);

    if (!user) return;

    const statementContent = [
        `Account Statement for: ${user.name}`,
        `Account Number: ${accountNumber}`,
        `Total Balance: ₹${user.balance.toFixed(2)}\n`,
        'Transaction History:',
        'Date\t\tType\t\tAmount\t\tBalance'
    ];

    userTransactions.forEach(transaction => {
        statementContent.push(
            `${new Date(transaction.date).toLocaleDateString()}\t${transaction.type}\t\t₹${transaction.amount.toFixed(2)}\t\t₹${transaction.balance.toFixed(2)}`
        );
    });

    const statementText = statementContent.join('\n');
    const blob = new Blob([statementText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${accountNumber}_statement.txt`;
    link.click();
}

// Modify existing updateAdminDashboard function to include these updates
function updateAdminDashboard() {
    if (!isAdminLoggedIn) return;

    updateUserStatistics();
    document.getElementById('searchUser').addEventListener('input', searchUsers);

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userTable = document.getElementById('adminUserTable');
    userTable.innerHTML = `
        <tr>
            <th>Account Number</th>
            <th>Name</th>
            <th>Email</th>
            <th>Balance</th>
            <th>Status</th>
            <th>Actions</th>
        </tr>
    `;

    users.forEach(user => {
        const row = userTable.insertRow();
        row.innerHTML = `
            <td>${user.accountNumber}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>₹${user.balance.toFixed(2)}</td>
            <td>${user.status || 'Active'}</td>
            <td>
                <button onclick="toggleAccountStatus('${user.accountNumber}')">${user.status === 'Inactive' ? 'Activate' : 'Deactivate'}</button>
                <button onclick="deleteAccount('${user.accountNumber}')">Delete</button>
                <button onclick="showManageAccount('${user.accountNumber}')">Manage</button>
                <button onclick="downloadAccountStatement('${user.accountNumber}')">Statement</button>
            </td>
        `;
    });
}



function showManageAccount(accountNumber) {
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.accountNumber === accountNumber);
    
    if (user) {
        document.getElementById('manageAccountForm').style.display = 'block';
        document.getElementById('manageAccountNumberDisplay').textContent = user.accountNumber;
        document.getElementById('manageBalanceDisplay').textContent = user.balance.toFixed(2);
        document.getElementById('manageAccountNumber').value = user.accountNumber;
        document.getElementById('manageBalance').value = user.balance;
        
        // Add account transfer section
        const transferSection = document.createElement('div');
        transferSection.innerHTML = `
            <h4><i class="fas fa-exchange-alt"></i> Account Transfer</h4>
            <div class="form-group">
                <label>Recipient Account Number</label>
                <input type="text" id="adminTransferAccount" placeholder="Enter recipient account number">
            </div>
            <div class="form-group">
                <label>Transfer Amount</label>
                <input type="number" id="adminTransferAmount" placeholder="Enter transfer amount">
            </div>
            <button class="btn btn-primary" onclick="adminAccountTransfer('${accountNumber}')">
                <i class="fas fa-money-bill-transfer"></i> Transfer
            </button>
            <p id="adminTransferMessage"></p>
        `;
        
        // Append transfer section to manage account form
        const manageForm = document.getElementById('manageAccountForm');
        manageForm.appendChild(transferSection);
    }
}

function adminAccountTransfer(senderAccountNumber) {
    const recipientAccount = document.getElementById('adminTransferAccount').value;
    const amount = parseFloat(document.getElementById('adminTransferAmount').value);
    const transferMessageEl = document.getElementById('adminTransferMessage');

    if (!recipientAccount || !amount) {
        transferMessageEl.textContent = 'Please enter recipient account and amount';
        return;
    }

    const users = JSON.parse(localStorage.getItem('users'));
    const senderIndex = users.findIndex(u => u.accountNumber === senderAccountNumber);
    const recipientIndex = users.findIndex(u => u.accountNumber === recipientAccount);

    if (senderIndex === -1 || recipientIndex === -1) {
        transferMessageEl.textContent = 'Invalid sender or recipient account';
        return;
    }

    if (amount <= 0) {
        transferMessageEl.textContent = 'Please enter a valid amount';
        return;
    }

    if (amount > users[senderIndex].balance) {
        transferMessageEl.textContent = 'Insufficient balance';
        return;
    }

    if (senderAccountNumber === recipientAccount) {
        transferMessageEl.textContent = 'Cannot transfer to the same account';
        return;
    }

    // Update balances
    users[senderIndex].balance -= amount;
    users[recipientIndex].balance += amount;
    localStorage.setItem('users', JSON.stringify(users));

    // Record transactions
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const timestamp = new Date().toISOString();
    
    transactions.push(
        {
            accountNumber: senderAccountNumber,
            date: timestamp,
            type: 'transfer-sent',
            amount: -amount,
            balance: users[senderIndex].balance
        },
        {
            accountNumber: recipientAccount,
            date: timestamp,
            type: 'transfer-received',
            amount: amount,
            balance: users[recipientIndex].balance
        }
    );

    localStorage.setItem('transactions', JSON.stringify(transactions));

    transferMessageEl.textContent = 'Transfer successful!';
    document.getElementById('adminTransferAccount').value = '';
    document.getElementById('adminTransferAmount').value = '';

    // Update manage account form display
    document.getElementById('manageBalanceDisplay').textContent = users[senderIndex].balance.toFixed(2);
    updateAdminDashboard();
}