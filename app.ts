#!/usr/bin/env node

interface BankAccount {
    accountNumber: number;
    balance: number;
    deposit(amount: number): void;
    withdraw(amount: number): void;
    getBalance(): number;
}

class BankAccountImpl implements BankAccount {
    constructor(public accountNumber: number, public balance: number = 0) {}

    deposit(amount: number): void {
        this.balance += amount;
        console.log(`Deposited $${amount}. New balance is $${this.balance}.`);
    }

    withdraw(amount: number): void {
        if (amount > this.balance) {
            console.log('Insufficient funds.');
        } else {
            this.balance -= amount;
            console.log(`Withdrew $${amount}. New balance is $${this.balance}.`);
        }
    }

    getBalance(): number {
        return this.balance;
    }
}

class CustomerDetails {
    constructor(
        public firstName: string,
        public lastName: string,
        public age: number,
        public gender: string,
        public contactNumber: string,
        public accountNumber: number
    ) {}
}

class Customer {
    accounts: BankAccount[] = [];
    details: CustomerDetails;

    constructor(details: CustomerDetails) {
        this.details = details;
    }

    addAccount(account: BankAccount): void {
        this.accounts.push(account);
    }

    getAccount(accountNumber: number): BankAccount | undefined {
        return this.accounts.find(account => account.accountNumber === accountNumber);
    }
}

import inquirer from 'inquirer';

const customers: Customer[] = [];

const mainMenu = async () => {
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'Select an option:',
            choices: ['New Customer', 'Existing Customer', 'Exit']
        }
    ]);

    if (answers.choice === 'New Customer') {
        await newCustomer();
    } else if (answers.choice === 'Existing Customer') {
        await existingCustomer();
    } else {
        console.log('Goodbye!');
    }
};

const newCustomer = async () => {
    const answers = await inquirer.prompt([
        { type: 'input', name: 'firstName', message: 'Enter your first name:' },
        { type: 'input', name: 'lastName', message: 'Enter your last name:' },
        { type: 'input', name: 'age', message: 'Enter your age:' },
        { type: 'input', name: 'gender', message: 'Enter your gender:' },
        { type: 'input', name: 'contactNumber', message: 'Enter your contact number:' }
    ]);

    const accountNumber = Math.floor(Math.random() * 1000000);
    const customerDetails = new CustomerDetails(
        answers.firstName,
        answers.lastName,
        parseInt(answers.age, 10),
        answers.gender,
        answers.contactNumber,
        accountNumber,
        
    );
    const customer = new Customer(customerDetails);
    customer.addAccount(new BankAccountImpl(accountNumber));
    customers.push(customer);
    console.log(`Account created with account number ${accountNumber}.`);
    await mainMenu();
};

const existingCustomer = async () => {
    const answers = await inquirer.prompt([
        { type: 'input', name: 'name', message: 'Enter your first name:' }
    ]);

    const customer = customers.find(cust => cust.details.firstName === answers.name);
    if (!customer) {
        console.log('Customer not found.');
        return await mainMenu();
    }

    const accountAnswers = await inquirer.prompt([
        { type: 'input', name: 'accountNumber', message: 'Enter your account number:' }
    ]);

    const accountNumber = parseInt(accountAnswers.accountNumber, 10);
    const account = customer.getAccount(accountNumber);

    if (!account) {
        console.log('Account not found.');
        return await mainMenu();
    }

    await accountMenu(customer, account);
};

const accountMenu = async (customer: Customer, account: BankAccount) => {
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'Select an option:',
            choices: ['Deposit', 'Withdraw', 'Check Balance', 'View Customer Information', 'Exit']
        }
    ]);

    if (answers.choice === 'Deposit') {
        const depositAnswers = await inquirer.prompt([
            { type: 'input', name: 'amount', message: 'Enter amount to deposit:' }
        ]);
        account.deposit(parseFloat(depositAnswers.amount));
    } else if (answers.choice === 'Withdraw') {
        const withdrawAnswers = await inquirer.prompt([
            { type: 'input', name: 'amount', message: 'Enter amount to withdraw:' }
        ]);
        account.withdraw(parseFloat(withdrawAnswers.amount));
    } else if (answers.choice === 'Check Balance') {
        console.log(`Your balance is $${account.getBalance()}.`);
    } else if (answers.choice === 'View Customer Information') {
        console.log(`
            Customer Information:
            Name: ${customer.details.firstName} ${customer.details.lastName}
            Age: ${customer.details.age}
            Gender: ${customer.details.gender}
            Contact Number: ${customer.details.contactNumber}
            Account Number: ${customer.details.accountNumber}
        `);
    } else {
        return await mainMenu();
    }

    await accountMenu(customer, account);
};

// Start the application
mainMenu();

