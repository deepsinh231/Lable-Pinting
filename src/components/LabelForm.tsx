"use client";
import { Input, Button } from "antd";
import { useState } from "react";

interface Props {
  onAdd: (item: Product) => void;
}

export interface Product {
  name: string;
  MRP: number;
  SMP: number;
  discount: string;
}

export default function LabelForm({ onAdd }: Props) {
  const [product, setProduct] = useState<Product>({
    name: "",
    MRP: 0,
    SMP: 0,
    discount: "",
  });

  const handleAdd = () => {
    if (!product.name || !product.MRP || !product.SMP || !product.discount) {
      alert("Fill all fields");
      return;
    }
    onAdd(product);
    setProduct({ name: "", MRP: 0, SMP: 0, discount: "" });
  };

  return (
    <div>
      <Input
        placeholder="Product Name"
        value={product.name}
        onChange={(e) => setProduct({ ...product, name: e.target.value })}
      />
      <Input
        type="number"
        placeholder="MRP"
        value={product.MRP}
        onChange={(e) => setProduct({ ...product, MRP: +e.target.value })}
      />
      <Input
        type="number"
        placeholder="DMart Price"
        value={product.SMP}
        onChange={(e) => setProduct({ ...product, SMP: +e.target.value })}
      />
      <Input
        placeholder="Discount (e.g. ₹250 OFF)"
        value={product.discount}
        onChange={(e) => setProduct({ ...product, discount: e.target.value })}
      />
      <Button type="primary" onClick={handleAdd}>
        Add Product
      </Button>
    </div>
  );
}
