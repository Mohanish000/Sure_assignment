const fs = require('fs');
const pdf = require('pdf-parse');

const SUPPORTED_ISSUERS = {
    'CHASE': 'Chase',
    'AMERICAN EXPRESS': 'American Express',
    'AMEX': 'American Express',
    'CITI': 'Citibank',
    'CAPITAL ONE': 'Capital One',
    'DISCOVER': 'Discover',
    'BANK OF AMERICA': 'Bank of America',
    'WELLS FARGO': 'Wells Fargo'
};

function detectIssuer(text) {
    const textUpper = text.toUpperCase();
    for (const [key, value] of Object.entries(SUPPORTED_ISSUERS)) {
        if (textUpper.includes(key)) {
            return value;
        }
    }
    return 'Unknown';
}

function extractCardLastFour(text) {
    const patterns = [
        /(?:CARD|ACCOUNT)(?:\s+(?:NUMBER|ENDING|NO\.?))?\s*[:\-]?\s*(?:x+|X+|\*+)?(\d{4})/i,
        /(?:ending|ends)\s+(?:in\s+)?(\d{4})/i,
        /x+(\d{4})/i,
        /\*+(\d{4})/i,
        /Account\s+Number[:\s]+\d*(\d{4})/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            return match[1];
        }
    }
    return null;
}

function extractBillingCycle(text) {
    const patterns = [
        /(?:Billing|Statement)\s+(?:Period|Cycle|Date)[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+(?:to|through|-)\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
        /(?:Statement|Billing)\s+(?:Closing|Period)\s+Date[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
        /(\w+\s+\d{1,2},?\s+\d{4})\s+(?:to|through|-)\s+(\w+\s+\d{1,2},?\s+\d{4})/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            if (match[2]) {
                return {
                    start_date: match[1],
                    end_date: match[2]
                };
            } else {
                return {
                    closing_date: match[1]
                };
            }
        }
    }
    return null;
}

function extractPaymentDueDate(text) {
    const patterns = [
        /(?:Payment|Pay)\s+Due\s+(?:Date|By)[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
        /(?:Payment|Pay)\s+Due[:\s]+(\w+\s+\d{1,2},?\s+\d{4})/i,
        /Due\s+Date[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            return match[1];
        }
    }
    return null;
}

function extractTotalBalance(text) {
    const patterns = [
        /(?:New|Total|Current)\s+Balance[:\s]+\$?([\d,]+\.\d{2})/gi,
        /(?:Balance|Amount)\s+Due[:\s]+\$?([\d,]+\.\d{2})/gi,
        /(?:Total|Outstanding)\s+(?:Amount|Balance)[:\s]+\$?([\d,]+\.\d{2})/gi,
        /Minimum\s+Payment(?:\s+Due)?[:\s]+\$?([\d,]+\.\d{2})/gi,
    ];

    const balances = {};

    for (const pattern of patterns) {
        let match;
        const regex = new RegExp(pattern);
        while ((match = regex.exec(text)) !== null) {
            const label = match[0].split(/[:]/)[0].trim();
            const amount = match[1];
            balances[label] = `$${amount}`;
        }
    }

    return Object.keys(balances).length > 0 ? balances : null;
}

function extractTransactions(text) {
    const transactions = [];
    const lines = text.split('\n');

    const patterns = [
        /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})?\s*([A-Za-z][A-Za-z0-9\s\.\-\*#]{3,}?)\s+\$?([\d,]+\.\d{2})/,
        /(\d{1,2}\/\d{1,2})\s+([A-Za-z][A-Za-z0-9\s\.\-\*#]{3,}?)\s+\$?([\d,]+\.\d{2})/,
    ];

    for (const line of lines) {
        for (const pattern of patterns) {
            const match = line.match(pattern);
            if (match) {
                let transaction = {};

                if (match[3] && match[4]) {
                    transaction = {
                        transaction_date: match[1],
                        post_date: match[2] || match[1],
                        description: match[3].trim(),
                        amount: `$${match[4]}`
                    };
                } else if (match[2] && match[3]) {
                    transaction = {
                        date: match[1],
                        description: match[2].trim(),
                        amount: `$${match[3]}`
                    };
                }

                if (transaction.description && transaction.description.length > 3) {
                    transactions.push(transaction);
                }
                break;
            }
        }

        if (transactions.length >= 15) break;
    }

    return transactions.slice(0, 10);
}

function extractCardVariant(text) {
    const patterns = [
        /((?:Visa|Mastercard|Master Card|Discover|American Express)\s+(?:Platinum|Gold|Silver|Classic|Signature|Infinite|World Elite|Preferred|Reserve|Sapphire|Freedom|Cash Back|Rewards|Premier)?)/i,
        /(Platinum|Gold|Silver|Classic|Signature|Infinite|World Elite|Preferred|Reserve|Sapphire|Freedom)\s+(?:Card|Credit)/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            return match[1].trim();
        }
    }
    return null;
}

async function parseStatement(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    const text = data.text;

    const result = {
        issuer: detectIssuer(text),
        card_last_four_digits: extractCardLastFour(text),
        card_variant: extractCardVariant(text),
        billing_cycle: extractBillingCycle(text),
        payment_due_date: extractPaymentDueDate(text),
        total_balance: extractTotalBalance(text),
        transactions: extractTransactions(text)
    };

    return result;
}

module.exports = { parseStatement };
