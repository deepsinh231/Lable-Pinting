import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Upload,
  message,
  Form,
  Modal,
  Card,
  Row,
  Col,
  Typography,
  Empty,
} from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  PlusOutlined,
  FilePdfOutlined,
  EditOutlined,
  DeleteFilled,
} from "@ant-design/icons";
import { jsPDF } from "jspdf";
import "./LabelApp.css";

const { Title, Text } = Typography;

export default function LabelGenerator() {
  const [products, setProducts] = useState([]);
  const [form] = Form.useForm();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [editForm] = Form.useForm();
  const [deleteAllModalVisible, setDeleteAllModalVisible] = useState(false);

  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('products', JSON.stringify(products));
    }
  }, [products]);

  const addEntry = (values) => {
    const newProduct = { ...values, key: `${Date.now()}-${products.length}` };
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    message.success("✅ Product added to list!");
    form.resetFields();
  };

  const deleteRow = (key) => {
    const updatedProducts = products.filter((item) => item.key !== key);
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    message.success("✅ Product deleted!");
  };

  const handleDeleteAll = () => {
    setProducts([]);
    localStorage.removeItem('products');
    setDeleteAllModalVisible(false);
    message.success("✅ All products deleted!");
  };

  const handleFileUpload = (info) => {
    const file = info.file;
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target.result);
        if (Array.isArray(content)) {
          const enriched = content.map((item, i) => ({
            ...item,
            key: `${Date.now()}-${i}`,
          }));
          setProducts(enriched);
          message.success("✅ JSON data loaded!");
        } else {
          message.error("❌ Invalid JSON structure.");
        }
      } catch {
        message.error("❌ Error parsing JSON.");
      }
    };
    reader.readAsText(file);
  };

  const generatePDF = async () => {
    try {
      const doc = new jsPDF();
      const pageHeight = doc.internal.pageSize.getHeight();
      const labelWidth = 90;
      const labelHeight = 60;
      const marginX = 10;
      const marginY = 10;

      let x = marginX;
      let y = marginY;
      let count = 0;

      for (let i = 0; i < products.length; i++) {
        const item = products[i];

        // --- Draw white rounded box with border (simulate shadow with thicker border) ---
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(1.5);
        doc.roundedRect(x, y, labelWidth, labelHeight, 6, 6, 'FD');
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.roundedRect(x, y, labelWidth, labelHeight, 6, 6);

        // --- SMP line: 'Rs.' (16), SMP (30, bold, blue), 'Only' (16), centered ---
        const smpRsFontSize = 16;
        const smpValueFontSize = 30;
        const smpOnlyFontSize = 16;
        doc.setFont('helvetica', 'bold');
        const smpRs = 'Rs.';
        const smpValue = `${item.SMP}`;
        const smpOnly = 'Only';
        // Measure widths
        doc.setFontSize(smpRsFontSize);
        const rsWidth = doc.getTextWidth(smpRs + ' ');
        doc.setFontSize(smpValueFontSize);
        const valueWidth = doc.getTextWidth(smpValue + ' ');
        doc.setFontSize(smpOnlyFontSize);
        const onlyWidth = doc.getTextWidth(smpOnly);
        const totalWidth = rsWidth + valueWidth + onlyWidth;
        let smpStartX = x + (labelWidth - totalWidth) / 2;
        const smpY = y + 15;
        // Draw 'Rs.'
        doc.setFontSize(smpRsFontSize);
        doc.setTextColor(34, 34, 34);
        doc.text(smpRs, smpStartX, smpY);
        smpStartX += rsWidth;
        // Draw SMP value (blue, big)
        doc.setFontSize(smpValueFontSize);
        doc.setTextColor(26, 35, 126);
        doc.text(smpValue, smpStartX, smpY);
        smpStartX += valueWidth;
        // Draw 'Only'
        doc.setFontSize(smpOnlyFontSize);
        doc.setTextColor(34, 34, 34);
        doc.text(smpOnly, smpStartX, smpY);

        // --- Name (bold, centered, wrap/shrink if needed) ---
        let nameFontSize = 22;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(33, 33, 33);
        let nameText = item.name;
        let nameLines = doc.splitTextToSize(nameText, labelWidth - 20);
        while (nameLines.length > 2 && nameFontSize > 8) {
          nameFontSize -= 1;
          doc.setFontSize(nameFontSize);
          nameLines = doc.splitTextToSize(nameText, labelWidth - 20);
        }
        if (nameLines.length > 2) {
          let firstLine = nameLines[0];
          while (doc.getTextWidth(firstLine + '...') > labelWidth - 20 && firstLine.length > 0) {
            firstLine = firstLine.slice(0, -1);
          }
          nameLines = [firstLine + '...', ''];
        }
        doc.setFontSize(nameFontSize);
        doc.setFont('helvetica', 'bold');
        doc.text(nameLines, x + labelWidth / 2, y + 28, { align: 'center' });

        // --- MRP (bold, centered, shrink if needed) ---
        let mrpFontSize = 18;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(44, 44, 44);
        let mrpText = `MRP Rs. ${item.MRP} /-`;
        while (doc.getTextWidth(mrpText) > labelWidth - 20 && mrpFontSize > 8) {
          mrpFontSize -= 1;
          doc.setFontSize(mrpFontSize);
        }
        doc.setFontSize(mrpFontSize);
        doc.setFont('helvetica', 'bold');

        // Draw red line above MRP
        doc.setDrawColor(255, 0, 0); // Red color
        doc.setLineWidth(1.5); // Increased line thickness
        const lineY = y + 45; // Position the line above MRP text
        doc.line(x + 10, lineY, x + labelWidth - 10, lineY);

        // Reset color for MRP text
        doc.setTextColor(44, 44, 44);
        doc.text(mrpText, x + labelWidth / 2, y + 47, { align: 'center' });

        // --- Discount (bold, green, centered, last line) ---
        let discountFontSizeFinal = 18;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(56, 142, 60);
        let discountTextFinal = `Discount: ${item.discount}`;
        while (doc.getTextWidth(discountTextFinal) > labelWidth - 20 && discountFontSizeFinal > 8) {
          discountFontSizeFinal -= 1;
          doc.setFontSize(discountFontSizeFinal);
        }
        doc.setFontSize(discountFontSizeFinal);
        doc.setFont('helvetica', 'bold');
        doc.text(discountTextFinal, x + labelWidth / 2, y + 56, { align: 'center' });

        count++;
        if (count % 2 === 0) {
          x = marginX;
          y += labelHeight + 10;
        } else {
          x = marginX + labelWidth + 10;
        }

        // Add new page if needed
        if (y + labelHeight > pageHeight - marginY) {
          doc.addPage();
          x = marginX;
          y = marginY;
        }
      }

      // Save the PDF
      doc.save("product-labels.pdf");
      message.success("✅ PDF generated successfully!");
    } catch (err) {
      message.error("❌ Failed to generate PDF. Please try again.");
      console.error("PDF Error:", err);
    }
  };

  const openEditModal = (product) => {
    setCurrentProduct(product);
    editForm.setFieldsValue(product);
    setEditModalVisible(true);
  };

  const handleEditSubmit = () => {
    editForm.validateFields().then((values) => {
      const updatedProducts = products.map((item) =>
        item.key === currentProduct.key ? { ...values, key: item.key } : item
      );
      setProducts(updatedProducts);
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      setEditModalVisible(false);
      message.success("✅ Product updated!");
    });
  };

  return (
    <div className="p-6 font-sans max-w-6xl mx-auto">
      <Title level={2}>🧾 Label Generator</Title>

      {/* Preview Card for First Product */}
      {products.length > 0 && (
        <div className="label-preview-card">
          <div className="label-preview-smp">
            <span className="label-preview-smp-rs">Rs.</span>
            <span className="label-preview-smp-value">{products[0].SMP}</span>
            <span className="label-preview-smp-only">Only</span>
          </div>
          <div className="label-preview-name">{products[0].name}</div>
          <div className="label-preview-mrp">MRP Rs. {products[0].MRP} /-</div>
          <div className="label-preview-discount">Discount: {products[0].discount}</div>
        </div>
      )}

      <div className="flex gap-4 mb-4">
        <Upload beforeUpload={() => false} onChange={handleFileUpload} accept=".json">
          <Button
            icon={<UploadOutlined />}
            className="custom-btn primary-btn"
            size="large"
          >
            Upload JSON File
          </Button>
        </Upload>

        {products.length > 0 && (
          <Button
            danger
            icon={<DeleteFilled />}
            onClick={() => setDeleteAllModalVisible(true)}
            className="custom-btn danger-btn"
            size="large"
          >
            Delete All Products
          </Button>
        )}
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={addEntry}
        className="max-w-xl mt-6"
      >
        <Form.Item label="Product Name" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="MRP" name="MRP" rules={[{ required: true }]}>
          <Input type="number" />
        </Form.Item>
        <Form.Item label="SMP" name="SMP" rules={[{ required: true }]}>
          <Input type="number" />
        </Form.Item>
        <Form.Item label="Discount" name="discount" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            htmlType="submit"
            className="custom-btn primary-btn"
            size="large"
          >
            Add to List
          </Button>
        </Form.Item>
      </Form>

      {products.length === 0 ? (
        <Empty description="No products added yet." className="my-10" />
      ) : (
        <>
          <Row gutter={[16, 16]} className="mt-10">
            {products.map((item) => (
              <Col span={12} md={8} lg={6} key={item.key}>
                <Card
                  className="product-card-animated"
                  title={<Text strong>{item.name}</Text>}
                  actions={[
                    <Button
                      key="edit"
                      icon={<EditOutlined />}
                      onClick={() => openEditModal(item)}
                      className="custom-btn icon-btn"
                    />,
                    <Button
                      key="delete"
                      icon={<DeleteOutlined />}
                      onClick={() => deleteRow(item.key)}
                      className="custom-btn icon-btn danger-btn"
                    />
                  ]}
                  variant="outlined"
                >
                  <p><Text type="secondary">MRP:</Text> ₹{item.MRP}</p>
                  <p><Text type="secondary">SMP:</Text> ₹{item.SMP}</p>
                  <p><Text type="secondary">Discount:</Text> {item.discount}</p>
                </Card>
              </Col>
            ))}
          </Row>

          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            onClick={generatePDF}
            className="custom-btn primary-btn mt-6"
            size="large"
          >
            Generate PDF
          </Button>
        </>
      )}

      <Modal
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditSubmit}
        title="Edit Product"
        okButtonProps={{ className: 'custom-btn primary-btn' }}
        cancelButtonProps={{ className: 'custom-btn' }}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item label="Product Name" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="MRP" name="MRP" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item label="SMP" name="SMP" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Discount" name="discount" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Delete All Products"
        open={deleteAllModalVisible}
        onOk={handleDeleteAll}
        onCancel={() => setDeleteAllModalVisible(false)}
        okText="Yes, Delete All"
        cancelText="Cancel"
        okButtonProps={{
          danger: true,
          className: 'custom-btn danger-btn'
        }}
        cancelButtonProps={{ className: 'custom-btn' }}
      >
        <p>Are you sure you want to delete all products? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}