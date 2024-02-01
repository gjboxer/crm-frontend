import React from 'react';
import { Spin, Table, Pagination, Button, Input, Modal } from 'antd';
import axios from 'axios';
import { DeleteOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons'; // Import the search icon
import './style.css';

// // load .env file
// require('dotenv').config();
// use the baseurl from .env file
const baseurl = process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8000' : 'https://crm.voyagerstales.com';

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isFetched: false,
            data: [],
            filteredData: [],
            pagination: { current: 1, pageSize: 10, total: 0 },
            searchText: '',
            selectedRowKeys: [], // Store keys of selected rows
            selectedRecord: null,
            selectedRows: [],
            categoryOptions: [],
            isModalVisible: false,
            editableRowKey: null,
            newLeadForm: {
                first_name: '',
                last_name: '',
                email: '',
                country: '',
                category: '',
            },
            isCreatingLead: false,
        };
        this.handleRowSelectionChange = this.handleRowSelectionChange.bind(this);
    }

    componentDidMount() {
        this.fetchData();
        this.fetchAgents();
        const token = JSON.parse(window.localStorage.getItem('user')).Token
        //  prod url='http://crm.voyagerstales.com/categories/api/'
        // dev url='http://127.0.0.1:8000/categories/api/'

        axios.get(`${baseurl}/categories/api/`, { headers: { Authorization: `Token ${token}` } })
            .then(response => {
                const categoryOptions = response.data.results.map(item => item);
                this.setState({ categoryOptions });
            })
            .catch(error => {
                console.log(error);
            });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.searchText !== '' && this.state.searchText === '') {
            this.filterData()
        }
    }

    fetchAgents = () => {
        const token = JSON.parse(window.localStorage.getItem('user')).Token
        axios.get(`${baseurl}/account/list`
            , { headers: { Authorization: `Token ${token}` } })
            .then(response => {
                const agentOptions = response.data.map(item => ({
                    ...item,
                    key: parseInt(item.id, 10)
                }));
                this.setState({ agentOptions });
            })
            .catch(error => {
                console.log(error);
            });
    }


    fetchData = () => {
        this.setState({ isFetched: true });
        const token = JSON.parse(window.localStorage.getItem('user')).Token

        axios.get(`${baseurl}/leads/api/`,
            { headers: { Authorization: `Token ${token}` } })
            .then(response => {
                const updatedData = (response.data.results).map(item => ({
                    ...item,
                    key: parseInt(item.id, 10)
                }));
                const totalItems = updatedData.length;
                this.setState({
                    data: updatedData,
                    filteredData: updatedData.slice(0, 10),
                    isFetched: false,
                    pagination: {
                        ...this.state.pagination,
                        total: totalItems
                    }
                });
            })
            .catch(error => {
                console.log(error);
                this.setState({ isFetched: false });
            });
    };

    handlePaginationChange = (page, pageSize) => {
        this.setState(
            {
                pagination: {
                    ...this.state.pagination,
                    current: page
                }
            },
            () => {
                this.filterData();
            }
        );
    };

    handleRowSelectionChange = (selectedRowKeys, selectedRows) => {
        this.setState({
            selectedRowKeys: selectedRowKeys
        });
    };

    handleNewLeadInputChange = (field, value) => {
        this.setState((prevState) => ({
            newLeadForm: {
                ...prevState.newLeadForm,
                [field]: value,
            },
        }));
    };


    filterData = () => {
        const { data, pagination, searchText, searchedColumn } = this.state;
        const startIndex = (pagination.current - 1) * pagination.pageSize;
        const endIndex = startIndex + pagination.pageSize;

        let filteredData = data.slice(startIndex, endIndex);

        if (searchText && searchedColumn) {
            filteredData = data.filter(item =>
                item[searchedColumn].toString().toLowerCase().includes(searchText.toLowerCase())
            );
        }

        this.setState({ filteredData });
    };

    handleJumpToFirst = () => {
        this.setState(
            {
                pagination: {
                    ...this.state.pagination,
                    current: 1
                }
            },
            () => {
                this.filterData();
            }
        );
    };


    handleGlobalSearch = (e) => {
        const { data } = this.state;
        const value = e.target.value.toLowerCase();
        const filteredData = data.filter((item) => {
            return Object.keys(item).some((key) =>
                item[key] && item[key].toString().toLowerCase().includes(value)
            );
        });
        this.setState({ filteredData, searchText: e.target.value });
    };


    handleJumpToLast = () => {
        const { pagination } = this.state;
        const totalPages = Math.ceil(this.state.data.length / pagination.pageSize);
        this.setState(
            {
                pagination: {
                    ...this.state.pagination,
                    current: totalPages
                }
            },
            () => {
                this.filterData();
            }
        );
    };

    handleEdit = (record) => {
        this.setState({
            editableRowKey: record.key,
        });
    };

    handleSave = (record) => {
        const { filteredData } = this.state;
        const newData = [...filteredData];
        const index = newData.findIndex((item) => record.key === item.key);

        if (index > -1) {
            newData[index] = { ...record };
            console.log("newData", newData[index])
            const data = {
                "first_name": newData[index]['first_name'],
                "last_name": newData[index]['last_name'],
                "email": newData[index]['email'],
                "country": newData[index]['country'],
                "category": newData[index]['category'],
                "category_name": newData[index]['category_name'],
                "hotel_name": newData[index]['hotel_name'],
                "hotel_address": newData[index]['hotel_address'],
                "phone_number": newData[index]['phone_number'],
                "agent": newData[index]['agent'],
                "age": newData[index]['age'],
                "url": newData[index]['url'],
                "description": newData[index]['description'],
            }
            const token = JSON.parse(window.localStorage.getItem('user')).Token
            axios.patch(`${baseurl}/leads/api/${newData[index]['id']}/`, data,
                { headers: { Authorization: `Token ${token}` } }).then(() => {
                    this.setState({ filteredData: newData, editableRowKey: null });
                })
        }
    };

    handleDelete = (record) => {
        this.setState({
            selectedRecord: record,
            isModalVisible: true,
        });
    };

    handleDeleteConfirm = () => {
        const { filteredData, selectedRecord } = this.state;
        const updatedData = filteredData.filter(item => item !== selectedRecord);

        const token = JSON.parse(window.localStorage.getItem('user')).Token
        axios.delete(`${baseurl}/leads/api/${selectedRecord['id']}/`,
            { headers: { Authorization: `Token ${token}` } }).then(() => {
                this.setState({ filteredData: updatedData, isModalVisible: false });
            })
    };

    handleDeleteCancel = () => {
        this.setState({
            isModalVisible: false,
        });
    };

    renderEditableCellStatus = (record, dataIndex) => {
        const { editableRowKey, categoryOptions } = this.state;
        const isEditable = record.key === editableRowKey;
        return isEditable && dataIndex === 'category_name' ? (
            <select
                value={record['category']}
                onChange={(e) => this.handleCellChange(record, 'category', e.target.value)}
            >
                {categoryOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                        {option.name}
                    </option>
                ))}
            </select>
        ) : (
            record[dataIndex]
        );
    };

    renderEditableCellAgent = (record, dataIndex) => {
        const { editableRowKey, agentOptions } = this.state;
        const isEditable = record.key === editableRowKey;
        return isEditable && dataIndex === 'agent_first_name' ? (
            <select
                value={record['agent']}
                onChange={(e) => this.handleCellChange(record, 'agent', e.target.value)}
            >
                {agentOptions.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                        {agent.first_name}
                    </option>
                ))}
            </select>
        ) : (
            record[dataIndex]
        );
    }


    renderEditableCell = (record, dataIndex) => {
        const { editableRowKey, categoryOptions } = this.state;
        const user = JSON.parse(window.localStorage.getItem('user'));
        const isEditable = record.key === editableRowKey;

        // Check if the user is admin or superuser
        const isAdminOrSuperuser = user && (user.role == "admin" || user.is_superuser);

        return isEditable ? (
            isAdminOrSuperuser ? ( // If the user is a superuser, allow editing all fields
                <Input
                    value={record[dataIndex]}
                    onChange={(e) => this.handleCellChange(record, dataIndex, e.target.value)}
                />
            ) : (
                record[dataIndex]
            )
        ) : (
            record[dataIndex]
        );
    };


    handleCellChange = (record, dataIndex, value) => {
        const { filteredData } = this.state;
        const newData = [...filteredData];
        const index = newData.findIndex((item) => record.key === item.key);

        if (index > -1) {
            newData[index][dataIndex] = value;
            this.setState({ data: newData });
        }
    };

    handleNewLeadInputChange = (field, value) => {
        this.setState((prevState) => ({
            newLeadForm: {
                ...prevState.newLeadForm,
                [field]: value,
            },
        }));
    };

    handleCreateLead = () => {
        const { newLeadForm } = this.state;

        const token = JSON.parse(window.localStorage.getItem('user')).Token;
        const user = JSON.parse(window.localStorage.getItem('user'));
        // if user is not admin or superuser, set the agent to the current user
        newLeadForm['agent'] = user && (user.role === 'admin' || user.is_superuser) ? newLeadForm['agent'] || null : user.id;

        // Make a POST request to create a new lead
        axios.post(`${baseurl}/leads/api/`, newLeadForm, {
            headers: {
                Authorization: `Token ${token}`,
            },
        })
            .then(response => {
                // Optionally, fetch updated data or update the table
                this.fetchData();

                // Reset the newLeadForm
                this.setState({
                    newLeadForm: {
                        first_name: '',
                        last_name: '',
                        email: '',
                        country: '',
                        category: '',
                    },
                    isCreatingLead: false,
                });
            })
            .catch(error => {
                console.error('Error creating new lead:', error);
                // Handle error, show an alert, etc.
            });
    };


    render() {
        const { newLeadForm, isCreatingLead, categoryOptions, agentOptions } = this.state;
        const { isFetched, filteredData, pagination, searchText, isModalVisible, selectedRowKeys } = this.state;
        const user = JSON.parse(window.localStorage.getItem('user'));

        const columns = [
            {
                title: 'First Name',
                dataIndex: 'first_name',
                key: 'first_name',
                render: (text, record) => this.renderEditableCell(record, 'first_name'),
            },
            {
                title: 'Last Name',
                dataIndex: 'last_name',
                key: 'last_name',
                render: (text, record) => this.renderEditableCell(record, 'last_name'),
            },
            {
                title: 'Age',
                dataIndex: 'age',
                key: 'age',
                render: (text, record) => this.renderEditableCell(record, 'age'),
            },
            {
                title: 'Hotel Name',
                dataIndex: 'hotel_name',
                key: 'hotel_name',
                render: (text, record) => this.renderEditableCell(record, 'hotel_name'),
            },
            {
                title: 'url',
                dataIndex: 'url',
                key: 'url',
                render: (text, record) => this.renderEditableCell(record, 'url'),

            },
            {
                title: 'Description',
                dataIndex: 'description',
                key: 'description',
                render: (text, record) => this.renderEditableCell(record, 'description'),
            },
            {
                title: 'Email',
                dataIndex: 'email',
                key: 'email',
                render: (text, record) => this.renderEditableCell(record, 'email'),
            },
            {
                title: 'Country',
                dataIndex: 'country',
                key: 'country',
                render: (text, record) => this.renderEditableCell(record, 'country'),
            },
            {
                title: 'Phone Number',
                dataIndex: 'phone_number',
                key: 'phone_number',
                render: (text, record) => this.renderEditableCell(record, 'phone_number'),

            },

            (user && (user.role == "admin" || user.is_superuser)) ? {
                title: 'Agent Name',
                dataIndex: 'agent_first_name',
                key: 'agent_first_name',
                render: (text, record) => this.renderEditableCellAgent(record, 'agent_first_name'),
            } : null,

            {
                title: 'Status',
                dataIndex: 'category_name',
                key: 'category_name',
                render: (text, record) => this.renderEditableCellStatus(record, 'category_name'),
            },
            {
                title: 'Added on',
                dataIndex: 'created_at',
                key: 'created_at',
                render: (text) => {
                    const formattedDate = new Date(text).toLocaleString();
                    return <span>{formattedDate}</span>;
                },
            },
            {
                title: 'Actions',
                key: 'actions',
                render: (text, record) => (
                    <span>
                        {this.state.editableRowKey !== record.key ? (
                            <Button className={'edit-button'} onClick={() => this.handleEdit(record)}>
                                <EditOutlined />
                            </Button>
                        ) : (
                            <Button className={'save-button'} onClick={() => this.handleSave(record)}>
                                <SaveOutlined />
                            </Button>
                        )}
                        {user && (user.role == "admin" || user.is_superuser) && (
                            <Button className={'delete-button'} onClick={() => this.handleDelete(record)}>
                                <DeleteOutlined />
                            </Button>
                        )}
                    </span>
                )
            }
        ].filter(column => column !== null);
        const rowSelection = {
            onChange: this.handleRowSelectionChange,
            selectedRowKeys: this.state.selectedRowKeys,
            columnWidth: '10px',
        };

        return (

            <div>
                <div style={{ marginLeft: 500 }}>
                    <Input
                        placeholder="Search in table"
                        value={searchText}
                        onChange={this.handleGlobalSearch}
                        style={{ width: 200, marginBottom: 10 }}
                    />

                    <Button style={{ color: "red", borderColor: "red", marginLeft: 50 }}
                        onClick={() => {
                            localStorage.removeItem('user');
                            window.location.href = '/';
                        }}>
                        Logout
                    </Button>
                    <Button
                        className={'new-lead-button'}
                        onClick={() => this.setState({ isCreatingLead: true })}
                    >
                        New Lead
                    </Button>

                    {isCreatingLead && (
                        <div className={'new-lead-form'}>
                            <Input
                                placeholder="First Name"
                                value={newLeadForm.first_name}
                                onChange={(e) => this.handleNewLeadInputChange('first_name', e.target.value)}
                            />
                            <Input
                                placeholder="Last Name"
                                value={newLeadForm.last_name}
                                onChange={(e) => this.handleNewLeadInputChange('last_name', e.target.value)}
                            />
                            <Input
                                placeholder="Age"
                                value={newLeadForm.age}
                                type='number'
                                onChange={(e) => this.handleNewLeadInputChange('age', e.target.value)}
                            />
                            <Input

                                placeholder="Email"
                                value={newLeadForm.email}
                                onChange={(e) => this.handleNewLeadInputChange('email', e.target.value)}
                            />
                            <Input

                                placeholder="Country"
                                value={newLeadForm.country}
                                onChange={(e) => this.handleNewLeadInputChange('country', e.target.value)}
                            />
                            <Input
                                placeholder='Hotel Name'
                                value={newLeadForm.hotel_name}
                                onChange={(e) => this.handleNewLeadInputChange('hotel_name', e.target.value)}
                            />
                            <Input
                                placeholder="Phone Number"
                                value={newLeadForm.phone_number}
                                onChange={(e) => this.handleNewLeadInputChange('phone_number', e.target.value)}
                            />
                            <Input
                                placeholder='Hotel Address'
                                value={newLeadForm.hotel_address}
                                onChange={(e) => this.handleNewLeadInputChange('hotel_address', e.target.value)}
                            />
                            <Input
                                placeholder='Url'
                                value={newLeadForm.url}
                                onChange={(e) => this.handleNewLeadInputChange('url', e.target.value)}
                            />

                            <Input
                                placeholder='Description'
                                value={newLeadForm.description}
                                onChange={(e) => this.handleNewLeadInputChange('description', e.target.value)}
                            />

                            <select
                                value={newLeadForm.category}
                                onChange={(e) => this.handleNewLeadInputChange('category', e.target.value)}
                            >
                                <option value="">Select Category</option>
                                {categoryOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>

                            {user && (user.role === 'admin' || user.is_superuser) && (
                                <select
                                    value={newLeadForm.agent}
                                    onChange={(e) => this.handleNewLeadInputChange('agent', e.target.value)}
                                >
                                    <option value="">Select Agent</option>
                                    {agentOptions.map((agent) => (
                                        <option key={agent.id} value={agent.id}>
                                            {agent.first_name}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <Button className={'save-button'} onClick={this.handleCreateLead}>
                                Save
                            </Button>
                            <Button className={'cancel-button'} onClick={() => this.setState({ isCreatingLead: false })}>
                                Cancel
                            </Button>
                        </div>
                    )}
                </div>
                <Spin spinning={isFetched}>
                    <Table
                        dataSource={filteredData}
                        columns={columns}
                        pagination={false}
                    // rowSelection={rowSelection} 
                    />
                    {selectedRowKeys.length > 0 && (
                        <div style={{ marginTop: 16, textAlign: 'right' }}>
                            {`${selectedRowKeys.length} row${selectedRowKeys.length > 1 ? 's' : ''} selected out of ${filteredData.length} 
                            rows`}
                        </div>
                    )}
                    <Pagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        onChange={this.handlePaginationChange}
                        style={{ marginTop: '20px', textAlign: 'center' }}
                    />
                    <Modal
                        title="Confirm Delete"
                        visible={isModalVisible}
                        onOk={this.handleDeleteConfirm}
                        onCancel={this.handleDeleteCancel}
                    >
                        <p>Are you sure you want to delete this record?</p>
                    </Modal>
                    <div style={{ marginTop: '10px', textAlign: 'center' }}>
                        <Button className={'jump-button'} onClick={this.handleJumpToFirst}>First Page</Button>
                        <Button className={'jump-button'} disabled={pagination.current === 1}
                            onClick={this.handlePaginationChange.bind(this, pagination.current - 1)}>
                            Previous Page
                        </Button>
                        <Button className={'jump-button'} disabled={pagination.current === Math.ceil(pagination.total / pagination.pageSize)}
                            onClick={this.handlePaginationChange.bind(this, pagination.current + 1)}>
                            Next Page
                        </Button>
                        <Button className={'jump-button'} onClick={this.handleJumpToLast}>Last Page</Button>
                    </div>

                </Spin>
            </div>

        );
    }
}

export default Home;