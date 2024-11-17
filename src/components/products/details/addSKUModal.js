import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

const AddSkuModal = ({ isOpen, onClose, productId }) => {
  const modalRef = useRef(null);
  const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    color: "",
    size: "",
    price: "",
    stock_quantity: "",
    sku_code: "",
    image: null,
    imagePreview: null
  });

  const colors = [
    "Đen", "Trắng", "Xám", "Đỏ", "Xanh", "Vàng",
    "Hồng", "Tím", "Cam", "Nâu", "Xanh lá", "Xanh dương"
  ];

  const sizes = ["S", "M", "L", "XL", "XXL", "XXXL"];

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadToS3 = async (file, userId, fileType = "image") => {
    try {
      const formData = new FormData();
      formData.append(fileType, file);
  
      const response = await fetch(`${API_ENDPOINT}/api/uploadAvatarS3/${userId}`, {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`Failed to upload ${fileType}`);
      }
  
      const data = await response.json();
      return data.avatar;
    } catch (error) {
      console.error(`Upload ${fileType} error:`, error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Upload image to S3 if exists
      let imageUrl = null;
      if (formData.image) {
        try {
          imageUrl = await uploadToS3(formData.image, "userId", "image");
        } catch (error) {
          console.error("Error uploading image:", error);
          throw new Error("Failed to upload image");
        }
      }

      const skuData = {
        color: formData.color,
        size: formData.size,
        price: formData.price,
        quantity: formData.stock_quantity,
        sku: formData.sku_code,
        image: imageUrl
      };

      const response = await fetch(
        `${API_ENDPOINT}/api/product/sku/${productId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(skuData),
        }
      );

      if (!response.ok) {
        alert("Thêm SKU thất bại");
        throw new Error("Failed to add SKU");
      }
      alert("Thêm SKU thành công");
      window.location.reload();
      onClose();
    } catch (error) {
      console.error("Error adding SKU:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      <div
        ref={modalRef}
        className="relative bg-white rounded-lg w-full max-w-2xl mx-4 my-6"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold text-gray-900">Thêm SKU mới</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            type="button"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-1">
              <label className="block mb-2 font-medium text-gray-700">
                Màu sắc *
              </label>
              <select
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              >
                <option value="">Chọn màu sắc</option>
                {colors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block mb-2 font-medium text-gray-700">
                Kích thước *
              </label>
              <select
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              >
                <option value="">Chọn kích thước</option>
                {sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block mb-2 font-medium text-gray-700">
                Mã SKU *
              </label>
              <input
                type="text"
                name="sku_code"
                value={formData.sku_code}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
                placeholder="Nhập mã SKU"
              />
            </div>

            <div className="col-span-1">
              <label className="block mb-2 font-medium text-gray-700">
                Giá *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
                min="0"
                step="1000"
              />
            </div>

            <div className="col-span-1">
              <label className="block mb-2 font-medium text-gray-700">
                Số lượng *
              </label>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
                min="0"
              />
            </div>

            <div className="col-span-1">
              <label className="block mb-2 font-medium text-gray-700">
                Hình ảnh
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
              {formData.imagePreview && (
                <img
                  src={formData.imagePreview}
                  alt="Preview"
                  className="mt-2 max-w-xs rounded"
                />
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Thêm SKU"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSkuModal;