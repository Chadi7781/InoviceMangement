import { useState } from 'react';
import * as React from 'react';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import { SingleDatePicker } from 'react-dates';
import { Card, CardBody, Row, Col, Input, FormGroup, Label, Table, Button, CardFooter, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { CreateInvoiceCommand, DiscountType, TaxType, InvoiceItemVm, InvoicesClient } from '../../utils/api';
import { getSubtotal, getTotal, getBalance } from '../../utils/invoiceUtils';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import * as moment from 'moment';

interface ICreateInvoice extends RouteComponentProps {

}

const CreateInvoice: React.FC<ICreateInvoice> = ({ history }) => {
    const [selectedDateFocus, setSelectedDateFocus] = useState<boolean | null>(false);
    const [selectedDueDateFocus, setSelectedDueDateFocus] = useState<boolean | null>(false);
    const [items, setItems] = useState<any[]>([])
    const initValue = new CreateInvoiceCommand({
        invoiceNumber: '',
        logo: '',
        from: '',
        to: '',
        date: undefined,
        paymentTerms: '',
        dueDate: undefined,
        discount: undefined,
        discountType: DiscountType.Percentage,
        tax: undefined,
        taxType: TaxType.Percentage,
        amountPaid: undefined,
        invoiceItems: [new InvoiceItemVm({ id: 0, item: '', quantity: undefined, rate: undefined, amount: 0 })]
    });

    const [invoiceData, setInvoiceData] = useState<CreateInvoiceCommand>(initValue);

    const [modal, setModal] = useState(false);
    const [title, setTile] = useState('');
    const [message, setMessage] = useState('');

    const toggle = () => setModal(!modal);

    const client = new InvoicesClient();

    const updateInvoiceItem = (property: 'item' | 'quantity' | 'rate', index: number, value: any) => {
        if (invoiceData && invoiceData.invoiceItems) {
            const items = [...invoiceData.invoiceItems];
             items[index][property] = value;
            setInvoiceData(new CreateInvoiceCommand({ ...invoiceData, invoiceItems: [...items] }));
        }
    }

    const addInvoiceItem = () => {
        if (invoiceData && invoiceData.invoiceItems) {
            const items = [...invoiceData.invoiceItems];
            items.push(new InvoiceItemVm({ id: 0, item: '', quantity: undefined, rate: undefined, amount: 0 }));
            setInvoiceData(new CreateInvoiceCommand({ ...invoiceData, invoiceItems: [...items] }));
        }
    }

    const removeItem = (index: number) => {
        if (invoiceData && invoiceData.invoiceItems) {
            const items = [...invoiceData.invoiceItems];
            items.splice(index, 1);
            setInvoiceData(new CreateInvoiceCommand({ ...invoiceData, invoiceItems: [...items] }));
        }
    }

    return (
        <div className="col-md-12">
            <Card>
                <CardBody>
                    <Row>
                        <Col md={6}>
                            <Input
                                type="text"
                                placeholder="Logo image url"
                                style={{ display: 'block', marginBottom: '20px' }}
                                value={invoiceData.logo}
                                onChange={(evt: any) => setInvoiceData(new CreateInvoiceCommand({ ...invoiceData, logo: evt.target.value }))}
                            />
                            <Input
                                type="textarea"
                                placeholder="Who is this invoice from? (required)"
                                style={{ display: 'block', resize: 'none', marginBottom: '20px' }}
                                value={invoiceData.from}
                                onChange={(evt: any) => setInvoiceData(new CreateInvoiceCommand({ ...invoiceData, from: evt.target.value }))}
                            />
                            <Input
                                type="textarea"
                                placeholder="Who is this invoice to? (required)"
                                style={{ display: 'block', resize: 'none', marginBottom: '20px' }}
                                value={invoiceData.to}
                                onChange={(evt: any) => setInvoiceData(new CreateInvoiceCommand({ ...invoiceData, to: evt.target.value }))}
                            />
                        </Col>
                        <Col md={6}>
                            <FormGroup row>
                                <Label md={4}>Invoice #</Label>
                                <Col md={8}>
                                    <Input type="text"
                                        placeholder="Invoice number"
                                        value={invoiceData.invoiceNumber}
                                        onChange={(evt: any) => setInvoiceData(new CreateInvoiceCommand({ ...invoiceData, invoiceNumber: evt.target.value }))} />
                                </Col>
                            </FormGroup>

                         

                            <FormGroup row>
                                <Label md={4}>Payment Terms</Label>
                                <Col md={8}>
                                    <Input type="text"
                                        placeholder="Payment terms"
                                        value={invoiceData.paymentTerms}
                                        onChange={(evt: any) => setInvoiceData(new CreateInvoiceCommand({ ...invoiceData, paymentTerms: evt.target.value }))} />
                                </Col>
                            </FormGroup>

                            <Row>
                                <Label md={4} style={{ fontWeight: 'bold' }}>Balance</Label>
                                <Label md={8} style={{ fontWeight: 'bold' }}>{getBalance(invoiceData)}</Label>
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <Table striped>
                                <thead>
                                    <tr>
                                        <th style={{ width: '60%' }}>Item</th>
                                        <th>Quantity</th>
                                        <th>Rate</th>
                                        <th>Amount</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoiceData.invoiceItems && invoiceData.invoiceItems.map((invoiceItem: InvoiceItemVm, index: number) =>
                                        <tr key={`item-${index}`}>
                                            <td>
                                                <Input
                                                    type="text"
                                                    placeholder="Item description"
                                                    value={invoiceItem.item}
                                                    onChange={(evt: any) => updateInvoiceItem('item', index, evt.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    value={invoiceItem.quantity || ''}
                                                    onChange={(evt: any) => updateInvoiceItem('quantity', index, evt.target.value ? parseInt(evt.target.value) : undefined)}
                                                />
                                            </td>
                                            <td>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    value={invoiceItem.rate || ''}
                                                    onChange={(evt: any) => updateInvoiceItem('rate', index, evt.target.value ? parseInt(evt.target.value) : undefined)}
                                                />
                                            </td>
                                            <td>S
                                                {invoiceItem.quantity && invoiceItem.rate && invoiceItem.quantity * invoiceItem.rate}
                                            </td>
                                            <td><Button color="danger" onClick={() => removeItem(index)}>X</Button></td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                            <Button className="btn btn-primary" onClick={() => addInvoiceItem()}>
                                Add Item
                            </Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}></Col>
                        <Col md={6}>
                            <FormGroup row>
                                <Label md={4}>Subtotal</Label>
                                <Col md={8}>
                                    {getSubtotal(invoiceData.invoiceItems)}
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label md={4}>Discount</Label>
                                <Col md={4}>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={invoiceData.discount || ''}
                                        onChange={(evt: any) => setInvoiceData(new CreateInvoiceCommand({ ...invoiceData, discount: evt.target.value ? parseInt(evt.target.value) : undefined }))} />
                                </Col>
                                <Col md={4}>
                                    <Input
                                        type="select"
                                        value={invoiceData.discountType}
                                        onChange={(evt: any) => setInvoiceData(new CreateInvoiceCommand({ ...invoiceData, discountType: evt.target.value }))}>
                                        <option value={DiscountType.Flat}>Flat rate</option>
                                        <option value={DiscountType.Percentage}>Percentage</option>
                                    </Input>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label md={4}>Tax</Label>
                                <Col md={4}>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={invoiceData.tax || ''}
                                        onChange={(evt: any) => setInvoiceData(new CreateInvoiceCommand({ ...invoiceData, tax: evt.target.value ? parseInt(evt.target.value) : undefined }))} />
                                </Col>
                                <Col md={4}>
                                    <Input
                                        type="select"
                                        value={invoiceData.taxType}
                                        onChange={(evt: any) => setInvoiceData(new CreateInvoiceCommand({ ...invoiceData, taxType: evt.target.value }))}>
                                        <option value={TaxType.Flat}>Flat rate</option>
                                        <option value={TaxType.Percentage}>Percentage</option>
                                    </Input>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label md={4}>Total</Label>
                                <Col md={8}>
                                    {getTotal(invoiceData)}
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label md={4}>Amount Paid</Label>
                                <Col md={8}>
                                    <Input type="number"
                                        placeholder="0"
                                        value={invoiceData.amountPaid || ''}
                                        onChange={(evt: any) => setInvoiceData(new CreateInvoiceCommand({ ...invoiceData, amountPaid: evt.target.value ? parseInt(evt.target.value) : undefined }))} />
                                </Col>
                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody>
                <CardFooter>
                    <Button
                        className="btn btn-primary"
                        onClick={() => {
                            client.create(invoiceData)
                                .then(() => history.push('/invoices'))
                                .catch(err => {
                                    setTile('Error');
                                    setMessage(err.message);
                                    setModal(true);
                                })
                        }}
                    >Save</Button>
                </CardFooter>
            </Card>
            <Modal isOpen={modal} toggle={toggle}>
                <ModalHeader toggle={toggle}>{title}</ModalHeader>
                <ModalBody>
                    {message}
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={toggle}>Ok</Button>
                </ModalFooter>
            </Modal>
        </div>
    )
}

export default withRouter(CreateInvoice);