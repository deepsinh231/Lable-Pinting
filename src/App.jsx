import React, { useState } from "react";
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
} from "@ant-design/icons";
import { jsPDF } from "jspdf";

const { Title, Text } = Typography;

export default function LabelGenerator() {
  const [products, setProducts] = useState([]);
  const [form] = Form.useForm();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [editForm] = Form.useForm();

  const addEntry = (values) => {
    setProducts((prev) => [...prev, { ...values, key: `${Date.now()}-${prev.length}` }]);
    message.success("✅ Product added to list!");
    form.resetFields();
  };

  const deleteRow = (key) => {
    setProducts((prev) => prev.filter((item) => item.key !== key));
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

        // Draw border
        doc.rect(x, y, labelWidth, labelHeight);

        // Draw discount box (yellow background, border, rotated text)
        // const discountBoxWidth = 14;
        // const discountBoxHeight = labelHeight - 10;
        // const discountBoxX = x - discountBoxWidth + 2;
        // const discountBoxY = y + 5;
        // Yellow background
        // doc.setFillColor(255, 230, 0);
        // doc.rect(discountBoxX, discountBoxY, discountBoxWidth, discountBoxHeight, 'F');
        // // Border
        // doc.setDrawColor(0, 0, 0);
        // doc.rect(discountBoxX, discountBoxY, discountBoxWidth, discountBoxHeight);
        // // --- Discount (vertical, auto-shrink) ---
        // let discountFontSize = 12;
        // doc.setFont('helvetica', 'bold');
        // doc.setTextColor(0, 0, 0);
        // let discountText = `${item.discount}`;
        // // Shrink font if discount text is too long
        // while (doc.getTextWidth(discountText) > discountBoxHeight - 8 && discountFontSize > 7) {
        //   discountFontSize -= 1;
        //   doc.setFontSize(discountFontSize);
        // }
        // Truncate with ellipsis if still too long
        // if (doc.getTextWidth(discountText) > discountBoxHeight - 8) {
        //   while (doc.getTextWidth(discountText + '...') > discountBoxHeight - 8 && discountText.length > 0) {
        //     discountText = discountText.slice(0, -1);
        //   }
        //   discountText += '...';
        // }
        // doc.setFontSize(discountFontSize);
        // doc.text(discountText, discountBoxX + discountBoxWidth / 2, discountBoxY + discountBoxHeight / 2 + 2, {
        //   angle: 10,
        //   align: 'center',
        // });

        // --- SMP line: 'Rs.' (16), SMP (30, bold), 'Only' (16), centered ---
        const smpRsFontSize = 16;
        const smpValueFontSize = 30;
        const smpOnlyFontSize = 16;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
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
        // Start x so the whole group is centered
        let smpStartX = x + (labelWidth - totalWidth) / 2;
        const smpY = y + 18;
        // Draw each part
        doc.setFontSize(smpRsFontSize);
        doc.text(smpRs, smpStartX, smpY);
        smpStartX += rsWidth;
        doc.setFontSize(smpValueFontSize);
        doc.text(smpValue, smpStartX, smpY);
        smpStartX += valueWidth;
        doc.setFontSize(smpOnlyFontSize);
        doc.text(smpOnly, smpStartX, smpY);

        // --- Name (bold, centered, wrap/shrink if needed) ---
        let nameFontSize = 18;
        doc.setFont('helvetica', 'bold');
        let nameText = item.name;
        let nameLines = doc.splitTextToSize(nameText, labelWidth - 20);
        // Shrink font if still too wide
        while (nameLines.length > 2 && nameFontSize > 8) {
          nameFontSize -= 1;
          doc.setFontSize(nameFontSize);
          nameLines = doc.splitTextToSize(nameText, labelWidth - 20);
        }
        // Truncate with ellipsis if still too long
        if (nameLines.length > 2) {
          let firstLine = nameLines[0];
          while (doc.getTextWidth(firstLine + '...') > labelWidth - 20 && firstLine.length > 0) {
            firstLine = firstLine.slice(0, -1);
          }
          nameLines = [firstLine + '...', ''];
        }
        doc.setFontSize(nameFontSize);
        doc.text(nameLines, x + labelWidth / 2, y + 28, { align: 'center' });

        // --- MRP (bold, centered, shrink if needed) ---
        let mrpFontSize = 14;
        doc.setFont('helvetica', 'bold');
        let mrpText = `MRP Rs. ${item.MRP} /-`;
        while (doc.getTextWidth(mrpText) > labelWidth - 20 && mrpFontSize > 8) {
          mrpFontSize -= 1;
          doc.setFontSize(mrpFontSize);
        }
        doc.setFontSize(mrpFontSize);
        doc.text(mrpText, x + labelWidth / 2, y + 40, { align: 'center' });

        // --- Discount (bold, centered, shrink if needed, last line) ---
        let discountFontSizeFinal = 14;
        doc.setFont('helvetica', 'bold');
        let discountTextFinal = `Discount: ${item.discount}`;
        while (doc.getTextWidth(discountTextFinal) > labelWidth - 20 && discountFontSizeFinal > 8) {
          discountFontSizeFinal -= 1;
          doc.setFontSize(discountFontSizeFinal);
        }
        doc.setFontSize(discountFontSizeFinal);
        doc.text(discountTextFinal, x + labelWidth / 2, y + 50, { align: 'center' });

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
      setProducts((prev) =>
        prev.map((item) => (item.key === currentProduct.key ? { ...values, key: item.key } : item))
      );
      setEditModalVisible(false);
      message.success("✅ Product updated!");
    });
  };

  return (
    <div className="p-6 font-sans max-w-6xl mx-auto">
      <Title level={2}>🧾 Label Generator</Title>

      {/* Show first product's price if available */}
      {products.length > 0 && (
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <Text strong style={{ fontSize: 32 }}>
            ₹ {products[0].SMP}
          </Text>
        </div>
      )}

      <Upload beforeUpload={() => false} onChange={handleFileUpload} accept=".json">
        <Button icon={<UploadOutlined />}>Upload JSON File</Button>
      </Upload>

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
          <Button icon={<PlusOutlined />} type="primary" htmlType="submit">
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
                  title={<Text strong>{item.name}</Text>}
                  actions={[
                    <EditOutlined key="edit" onClick={() => openEditModal(item)} />,
                    <DeleteOutlined key="delete" onClick={() => deleteRow(item.key)} />
                  ]}
                  bordered
                >
                  <p><Text type="secondary">MRP:</Text> ₹{item.MRP}</p>
                  <p><Text type="secondary">SMP:</Text> ₹{item.SMP}</p>
                  <p><Text type="secondary">Discount:</Text> {item.discount}</p>
                </Card>
              </Col>
            ))}
          </Row>

          <Button type="primary" icon={<FilePdfOutlined />} onClick={generatePDF} className="mt-6" size="large">
            Generate PDF
          </Button>
        </>
      )}

      <Modal
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditSubmit}
        title="Edit Product"
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
    </div>
  );
}