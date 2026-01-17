import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "../../components/DashboardLayout";
import axiosInstance from "../../utils/axioInstance";

const ClientDetails = () => {
  const { currentUser } = useSelector((state) => state.user);
  const clientId = currentUser?._id;

  const [loading, setLoading] = useState(true);
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

  // 🔹 Fetch client details
  const getClientDetails = async () => {
    try {
      const res = await axiosInstance.get(`/client/details/${clientId}`);

      const client = res.data.client[0];

      console.log(res)

      setFormData({
        clientName: client.clientName || "",
        businessType: client.businessType || "",
        pan: client.pan || "",
        aadhaar: client.aadhaar || "",
        gst: client.gst || "",
        email: client.email || "",
        mobile: client.mobile || "",
        address: client.address || "",
        contactPerson: client.contactPerson || "",
        natureOfBusiness: client.natureOfBusiness || "",
        documents: [],
      });

      setLoading(false);
    } catch (error) {
      console.error("❌ Fetch Error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      getClientDetails();
    }
  }, [clientId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "documents") {
      setFormData((prev) => ({ ...prev, documents: files }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 🔹 Update Client
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
      await axiosInstance.put(`/client/${clientId}`, data);
      alert("✅ Client details updated successfully!");
    } catch (error) {
      console.error("❌ Update Error:", error);
      alert("Update failed");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <DashboardLayout activeMenu="Your Details">
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Client Details (View / Edit)
        </h2>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-md grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Input label="Client Name" name="clientName" value={formData.clientName} onChange={handleChange} />
          <Select label="Business Type" name="businessType" value={formData.businessType} onChange={handleChange} />
          <Input label="PAN" name="pan" value={formData.pan} onChange={handleChange} />
          <Input label="Aadhaar" name="aadhaar" value={formData.aadhaar} onChange={handleChange} />
          <Input label="GST" name="gst" value={formData.gst} onChange={handleChange} />
          <Input label="Email" name="email" value={formData.email} onChange={handleChange} />
          <Input label="Mobile" name="mobile" value={formData.mobile} onChange={handleChange} />
          <Input label="Contact Person" name="contactPerson" value={formData.contactPerson} onChange={handleChange} />
          <Input label="Nature of Business" name="natureOfBusiness" value={formData.natureOfBusiness} onChange={handleChange} />
          <Textarea label="Address" name="address" value={formData.address} onChange={handleChange} />

          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">Upload New Documents</label>
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
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Update Details
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ClientDetails;


// 🔹 Reusable Inputs
const Input = ({ label, ...props }) => (
  <div>
    <label className="text-sm text-gray-600">{label}</label>
    <input {...props} className="mt-1 w-full border rounded-lg p-2 text-sm" />
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div className="md:col-span-2">
    <label className="text-sm text-gray-600">{label}</label>
    <textarea {...props} rows="3" className="mt-1 w-full border rounded-lg p-2 text-sm" />
  </div>
);

const Select = ({ label, ...props }) => (
  <div>
    <label className="text-sm text-gray-600">{label}</label>
    <select {...props} className="mt-1 w-full border rounded-lg p-2 text-sm">
      <option value="">Select Type</option>
      <option value="Individual">Individual</option>
      <option value="Firm">Firm</option>
      <option value="Company">Company</option>
    </select>
  </div>
);
