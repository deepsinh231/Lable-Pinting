"use client";
import { Table, Button, TableProps } from 'antd';
import { Product } from './LabelForm';
import { ChangeEvent } from 'react';

interface Props {
    data: Product[];
    onDelete: (index: number) => void;
}

export default function ProductTable({ data, onDelete }: Props) {
    const columns: TableProps<Product>['columns'] = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'MRP', dataIndex: 'MRP', key: 'MRP' },
        { title: 'SMP', dataIndex: 'SMP', key: 'SMP' },
        { title: 'Discount', dataIndex: 'discount', key: 'discount' },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, __: Product, index?: number) => (
                <Button danger onClick={() => onDelete(index!)}>Delete</Button>
            )
        },
    ];

    return (
        <Table<Product>
            dataSource={data}
            columns={columns}
            rowKey={(_, index) => index!.toString()}
            pagination={false}
        />
    );
}
