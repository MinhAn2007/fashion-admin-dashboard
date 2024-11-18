import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

const AddCategoryModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);
  const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentCategory: "",
    status: "active",
    image: null,
    imagePreview: null
  });

  const [parentCategories, setParentCategories] = useState([]);

  // Fetch parent categories on modal open
  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        const response = await fetch(`${API_ENDPOINT}/api/categories`);
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setParentCategories(data.categories || []);
      } catch (error) {
        console.error("Error fetching parent categories:", error);
      }
    };

    if (isOpen) {
      fetchParentCategories();
    }
  }, [isOpen, API_ENDPOINT]);

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


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const categoryData = {
        name: formData.name,
        description: formData.description,
        parent_id: formData.parentCategory || null,
        status: formData.status === "active" ? 1 : 0,
      };

      const response = await fetch(
        `${API_ENDPOINT}/api/categories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(categoryData),
        }
      );

      if (!response.ok) {
        alert("Thêm danh mục thất bại");
        throw new Error("Failed to add category");
      }
      alert("Thêm danh mục thành công");
      window.location.reload();
      onClose();
    } catch (error) {
      console.error("Error adding category:", error);
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
          <h3 className="text-xl font-semibold text-gray-900">Thêm danh mục mới</h3>
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
            <div className="col-span-2">
              <label className="block mb-2 font-medium text-gray-700">
                Tên danh mục *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
                placeholder="Nhập tên danh mục"
              />
            </div>

            <div className="col-span-2">
              <label className="block mb-2 font-medium text-gray-700">
                Mô tả
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                rows="3"
                placeholder="Nhập mô tả danh mục"
              />
            </div>

            <div className="col-span-1">
              <label className="block mb-2 font-medium text-gray-700">
                Danh mục cha
              </label>
              <select
                name="parentCategory"
                value={formData.parentCategory}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              >
                <option value="">Không có danh mục cha</option>
                {parentCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block mb-2 font-medium text-gray-700">
                Trạng thái
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Ẩn</option>
              </select>
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
              {loading ? "Đang xử lý..." : "Thêm danh mục"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;