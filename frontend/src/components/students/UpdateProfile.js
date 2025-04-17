import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Card,
  message,
  Typography,
  Space,
  Divider,
  Alert,
  Spin
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
  CalendarOutlined,
  SaveOutlined,
  RollbackOutlined
} from "@ant-design/icons";
import moment from "moment";

const { Title, Text } = Typography;
const { Option } = Select;

const UpdateProfile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    gender: "",
    address: "",
    birthday: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");

  // Fetch user data on component mount
  useEffect(() => {
    if (!token) {
      setErrorMessage("Please log in to update your profile.");
      setInitializing(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const { fullname, phone, gender, address, birthday } = response.data;
        const formattedBirthday = birthday ? birthday.split("T")[0] : "";
        
        const userData = {
          fullname: fullname || "",
          phone: phone || "",
          gender: gender || "",
          address: address || "",
          birthday: formattedBirthday ? moment(formattedBirthday) : null,
        };
        
        setFormData(userData);
        form.setFieldsValue(userData);
      } catch (error) {
        setErrorMessage("Unable to retrieve user information.");
        message.error("Failed to load profile data");
      } finally {
        setInitializing(false);
      }
    };

    fetchUserData();
  }, [token, form]);

  // Validate phone number
  const validatePhone = (_, value) => {
    const phoneRegex = /^[0-9]{9,11}$/;
    if (!value) {
      return Promise.reject("Please enter your phone number");
    }
    if (!phoneRegex.test(value)) {
      return Promise.reject("Phone number must be 9-11 digits");
    }
    return Promise.resolve();
  };

  // Validate birthday
  const disabledDate = (current) => {
    // Can't select days in the future
    return current && current > moment().endOf('day');
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    setLoading(true);
    
    if (!token) {
      setErrorMessage("Please log in to update your profile.");
      setLoading(false);
      return;
    }
    
    // Format the date for the API
    const formattedData = {
      ...values,
      birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') : null,
    };

    try {
      await axios.post(
        "http://localhost:3000/api/users/update-profile",
        formattedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage("Profile updated successfully!");
      setErrorMessage("");
      message.success("Profile updated successfully!");

      // Navigate after delay
      setTimeout(() => {
        navigate("/userprofile");
      }, 2000);
    } catch (error) {
      if (error.response) {
        const errorMsg = error.response.data.message || "Failed to update profile. Please try again.";
        setErrorMessage(errorMsg);
        message.error(errorMsg);
      } else {
        setErrorMessage("Network error occurred. Please check your connection.");
        message.error("Network error occurred. Please check your connection.");
      }
      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f0f2f5'
      }}>
        <Spin size="large" tip="Loading profile data..." />
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '24px', 
      background: '#f0f2f5', 
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    }}>
      <Card 
        style={{ 
          maxWidth: '800px', 
          width: '100%', 
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}
      >
        <Title level={2} style={{ textAlign: 'center', color: '#1890ff', marginBottom: '24px' }}>
          Update Profile
        </Title>
        
        <Divider style={{ margin: '0 0 24px 0' }} />
        
        {successMessage && (
          <Alert
            message="Success"
            description={successMessage}
            type="success"
            showIcon
            style={{ marginBottom: '24px' }}
          />
        )}
        
        {errorMessage && (
          <Alert
            message="Error"
            description={errorMessage}
            type="error"
            showIcon
            style={{ marginBottom: '24px' }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={formData}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <Form.Item
              name="fullname"
              label="Full Name"
              rules={[{ required: true, message: 'Please enter your full name' }]}
            >
              <Input 
                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} 
                placeholder="Enter your full name" 
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[{ validator: validatePhone }]}
            >
              <Input 
                prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Enter your phone number" 
              />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true, message: 'Please select your gender' }]}
            >
              <Select placeholder="Select your gender">
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="birthday"
              label="Birthday"
              rules={[{ required: true, message: 'Please select your birthday' }]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                disabledDate={disabledDate}
                format="YYYY-MM-DD"
                placeholder="Select your birthday"
                suffixIcon={<CalendarOutlined style={{ color: '#bfbfbf' }} />}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: 'Please enter your address' }]}
          >
            <Input 
              prefix={<HomeOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Enter your address" 
            />
          </Form.Item>

          <Form.Item style={{ marginTop: '24px', textAlign: 'center' }}>
            <Space size="middle">
              <Button 
                icon={<RollbackOutlined />} 
                onClick={() => navigate('/userprofile')}
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SaveOutlined />}
              >
                Update Profile
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UpdateProfile;