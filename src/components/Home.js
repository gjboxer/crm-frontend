import React from 'react';
import {Spin, Table, Pagination, Button, Input, Modal} from 'antd';
import axios from 'axios';
import {DeleteOutlined, EditOutlined, SaveOutlined, UsergroupDeleteOutlined} from '@ant-design/icons'; // Import the search icon
import './style.css';

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
            isModalVisible: false,
            editableRowKey: null,
        };
        this.handleRowSelectionChange = this.handleRowSelectionChange.bind(this);
    }

    componentDidMount() {
        this.fetchData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevState.searchText !== '' && this.state.searchText === '') {
            this.filterData()
        }
    }

    fetchData = () => {
        this.setState({ isFetched: true });
        const token =  JSON.parse(window.localStorage.getItem('user')).Token

        axios.get(`http://127.0.0.1:8000/leads/api/`,
            {headers: {Authorization: `Token ${token}`}})
            .then(response => {
                console.log("__1", response.data.results)
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

    handleBulkDelete = () => {
        const { filteredData, selectedRowKeys } = this.state;
        const updatedData = filteredData.filter((item) => !selectedRowKeys.includes(item.key));

        this.setState({
            filteredData: updatedData,
            selectedRowKeys: [],
        });
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
            const data = {
                "first_name": newData[index]['first_name'],
                "last_name": newData[index]['last_name'],
                "email": newData[index]['email'],
                "country": newData[index]['country'],
            }
            const token =  JSON.parse(window.localStorage.getItem('user')).Token
            axios.patch(`http://127.0.0.1:8000/leads/api/${newData[index]['id']}/`, data,
            {headers: {Authorization: `Token ${token}`}}).then(() => {
                this.setState({filteredData: newData, editableRowKey: null});
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

        const token =  JSON.parse(window.localStorage.getItem('user')).Token
        axios.delete(`http://127.0.0.1:8000/leads/api/${selectedRecord['id']}/`,
        {headers: {Authorization: `Token ${token}`}}).then(() => {
            this.setState({filteredData: updatedData, isModalVisible: false});
        })
    };

    handleDeleteCancel = () => {
        this.setState({
            isModalVisible: false,
        });
    };

    renderEditableCell = (record, dataIndex) => {
        const { editableRowKey } = this.state;
        const isEditable = record.key === editableRowKey;

        return isEditable ? (
            <Input
                value={record[dataIndex]}
                onChange={(e) => this.handleCellChange(record, dataIndex, e.target.value)}
            />
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

    render() {

        const { isFetched, filteredData, pagination, searchText, isModalVisible, selectedRowKeys } = this.state;
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
                        <Button className={'delete-button'} onClick={() => this.handleDelete(record)}>
                            <DeleteOutlined />
                        </Button>
                    </span>
                )
            }
        ];
        const rowSelection = {
            onChange: this.handleRowSelectionChange,
            selectedRowKeys: this.state.selectedRowKeys,
            columnWidth: '10px',
        };

        return (

            <div>
                <div style={{marginLeft: 500}}>
                    <Input
                        placeholder="Search in table"
                        value={searchText}
                        onChange={this.handleGlobalSearch}
                        style={{ width: 200, marginBottom: 10 }}
                    />

                    <Button style={{color: "red", borderColor: "red", marginLeft: 50}}
                            onClick={() => {
                                localStorage.removeItem('user');
                                window.location.href = '/';
                            }}>
                        Logout
                    </Button>
                </div>
                <Spin spinning={isFetched}>
                    <Table
                        dataSource={filteredData}
                        columns={columns}
                        pagination={false}
                        rowSelection={rowSelection}/>
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
                        <Button className={'jump-button'} disabled={pagination.current === Math.ceil(pagination.total/pagination.pageSize)}
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