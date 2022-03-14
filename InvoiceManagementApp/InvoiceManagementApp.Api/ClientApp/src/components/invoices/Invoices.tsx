import * as React from 'react';

import { useState, useEffect } from 'react';
import { InvoiceVm, InvoicesClient } from '../../utils/api';
import { getBalance } from '../../utils/invoiceUtils';

interface IInvoices {

}

const Invoices: React.FC<IInvoices> = ({ }) => {
    const [invoices, setInvoices] = useState<InvoiceVm[]>([]);
    const client = new InvoicesClient();

    useEffect(() => {
        client.get().then(res => setInvoices(res))
            .catch(err => console.log(err));
    }, [])

    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>Invoice #</th>
                        <th>Balance</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices && invoices.map(invoice => <tr key={`invoice-${invoice.id}`}>
                        <td>{invoice.invoiceNumber}</td>
                        <td>{getBalance(invoice)}</td>
                    </tr>)}
                </tbody>
            </table>
        </div>
    )
}

export default Invoices