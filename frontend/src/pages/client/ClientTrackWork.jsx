import React, { useState } from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "../../components/DashboardLayout";
import axiosInstance from "../../utils/axioInstance";

const ClientTrackWork = () => {
  const { currentUser } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    clientName: "",
    businessType: "",
    pan: "",
    aadhaar: "",
    gst: "",
    email: "",
    mobile: "",
    address: "",
    contactPerson: "",
    natureOfBusiness: "",
    documents: [],
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "documents") {
      setFormData({ ...formData, documents: files });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "documents") {
        for (let file of formData.documents) {
          data.append("documents", file);
        }
      } else {
        data.append(key, formData[key]);
      }
    });

    try {
      await axiosInstance.post("/client/add-details", data);
      alert("✅ Client details submitted successfully!");
    } catch (err) {
      console.error("❌ Error submitting form:", err);
      alert("Something went wrong");
    }
  };

  return (
    <DashboardLayout activeMenu="Track Work">
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Fill Client Details
        </h2>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-md grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Input label="Client Name" name="clientName" onChange={handleChange} />
          <Select label="Business Type" name="businessType" onChange={handleChange} />
          <Input label="PAN" name="pan" onChange={handleChange} />
          <Input label="Aadhaar" name="aadhaar" onChange={handleChange} />
          <Input label="GST" name="gst" onChange={handleChange} />
          <Input label="Email" name="email" onChange={handleChange} />
          <Input label="Mobile" name="mobile" onChange={handleChange} />
          <Input label="Contact Person" name="contactPerson" onChange={handleChange} />
          <Input label="Nature of Business" name="natureOfBusiness" onChange={handleChange} />
          <Textarea label="Address" name="address" onChange={handleChange} />

          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">Upload Documents</label>
            <input
              type="file"
              name="documents"
              multiple
              onChange={handleChange}
              className="mt-1 block w-full text-sm"
            />
          </div>

          <div className="md:col-span-2 text-right">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Submit Details
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ClientTrackWork;

// Reusable Inputs
const Input = ({ label, ...props }) => (
  <div>
    <label className="text-sm text-gray-600">{label}</label>
    <input
      {...props}
      className="mt-1 w-full border rounded-lg p-2 text-sm"
      required
    />
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div className="md:col-span-2">
    <label className="text-sm text-gray-600">{label}</label>
    <textarea
      {...props}
      rows="3"
      className="mt-1 w-full border rounded-lg p-2 text-sm"
      required
    />
  </div>
);

const Select = ({ label, name, onChange }) => (
  <div>
    <label className="text-sm text-gray-600">{label}</label>
    <select
      name={name}
      onChange={onChange}
      className="mt-1 w-full border rounded-lg p-2 text-sm"
      required
    >
      <option value="">Select Type</option>
      <option value="Individual">Individual</option>
      <option value="Firm">Firm</option>
      <option value="Company">Company</option>
    </select>
  </div>
);
