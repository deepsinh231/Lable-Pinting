"use client";
import React from 'react';
import { useState } from 'react';
import LabelForm, { Product } from '@/components/LabelForm';
import ProductTable from '@/components/ProductTable';
import StyleEditor from '@/components/StyleEditor';
import PDFPreview from '@/components/PDFPreview';
import { Button } from 'antd';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  const handleAdd = (item: Product) => {
    setProducts(prev => [...prev, item]);
  };

  const handleDelete = (index: number) => {
    const updated = [...products];
    updated.splice(index, 1);
    setProducts(updated);
  };

  const handleGeneratePDF = async () => {
    const input = document.getElementById("pdf-content");
    if (!input) return alert("No data to generate PDF.");
    const canvas = await html2canvas(input, { scale: 2 } as any);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save("Discount_Labels.pdf");
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Discount Label Generator</h1>
      <LabelForm onAdd={handleAdd} />
      <ProductTable data={products} onDelete={handleDelete} />
      <h2>Style Editor</h2>
      <StyleEditor />
      <h2>PDF Preview</h2>
      <PDFPreview data={products} />
      <Button type="primary" onClick={handleGeneratePDF}>Generate PDF</Button>
    </div>
  );
}

