"use client";
import { Input, Select, Button } from 'antd';
import { useEffect } from 'react';

export default function StyleEditor() {
    const handleStyleChange = (e: any) => {
        const id = e.target.id;
        const val = e.target.value + (id.includes('font') ? 'px' : '');
        document.documentElement.style.setProperty(`--${id}`, val);
        localStorage.setItem(`--${id}`, val);
    };

    useEffect(() => {
        ['font-sm', 'font-md', 'font-lg', 'font-xl', 'primary-color', 'danger-color'].forEach(key => {
            const val = localStorage.getItem(`--${key}`);
            if (val) document.documentElement.style.setProperty(`--${key}`, val);
        });
    }, []);

    return (
        <div>
            <Select defaultValue="Poppins" style={{ width: 200 }} onChange={val => {
                document.documentElement.style.setProperty('--font-family', val);
                localStorage.setItem('--font-family', val);
            }}>
                <Select.Option value="'Poppins', sans-serif">Poppins</Select.Option>
                <Select.Option value="Arial, sans-serif">Arial</Select.Option>
                <Select.Option value="'Segoe UI', sans-serif">Segoe UI</Select.Option>
            </Select>
            <Input id="font-sm" type="number" placeholder="Small Font Size" onChange={handleStyleChange} />
            <Input id="font-md" type="number" placeholder="Medium Font Size" onChange={handleStyleChange} />
            <Input id="font-lg" type="number" placeholder="Large Font Size" onChange={handleStyleChange} />
            <Input id="font-xl" type="number" placeholder="XL Font Size" onChange={handleStyleChange} />
            <Input id="primary-color" type="color" onChange={handleStyleChange} />
            <Input id="danger-color" type="color" onChange={handleStyleChange} />
            <Button onClick={() => { localStorage.clear(); location.reload(); }}>Reset Styles</Button>
        </div>
    );
}
