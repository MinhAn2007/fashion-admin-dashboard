import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

const AddProductForm = () => {
  const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: "",
    description: "",
    category_id: "",
    status: 1,
    featured: 0,
  });

  const [skus, setSkus] = useState([
    {
      size_attribute_id: "M",
      color_attribute_id: "Đen",
      sku: "",
      price: "",
      quantity: "",
      image: null,
      imagePreview: null,
    },
  ]);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_ENDPOINT}/api/categories`);
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [API_ENDPOINT]);

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSkuChange = (index, e) => {
    const { name, value } = e.target;
    const newSkus = [...skus];
    newSkus[index] = {
      ...newSkus[index],
      [name]: value,
    };
    setSkus(newSkus);
  };

  const handleImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newSkus = [...skus];
        newSkus[index] = {
          ...newSkus[index],
          image: file,
          imagePreview: reader.result,
        };
        setSkus(newSkus);
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

  const addNewSku = () => {
    setSkus((prev) => [
      ...prev,
      {
        size_attribute_id: "M",
        color_attribute_id: "Đen",
        sku: "",
        price: "",
        quantity: "",
        image: null,
        imagePreview: null,
      },
    ]);
  };

  const removeSku = (index) => {
    setSkus((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      // Upload images to S3 first
      const skusWithUrls = await Promise.all(
        skus.map(async (sku) => {
          let imageUrl = null;
          if (sku.image) {
            try {
              // Assuming you have access to userId, add it as a parameter if needed
              imageUrl = await uploadToS3(sku.image, "userId", "image");
            } catch (error) {
              console.error("Error uploading image:", error);
              throw new Error(`Failed to upload image for SKU: ${sku.sku}`);
            }
          }
          return {
            ...sku,
            image: imageUrl,
          };
        })
      );
      
      // Prepare the request body with uploaded image URLs
      const requestBody = {
        ...product,
        skus: skusWithUrls.map(sku => ({
          size_attribute_id: sku.size_attribute_id,
          color_attribute_id: sku.color_attribute_id,
          sku: sku.sku,
          price: parseFloat(sku.price),
          quantity: parseInt(sku.quantity, 10),
          image: sku.image, // This will be the S3 URL
        }))
      };

      const response = await fetch(`${API_ENDPOINT}/api/product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add product");
      }

      alert("Thêm sản phẩm thành công");
      navigate("/product");
      // Reset form
      setProduct({
        name: "",
        description: "",
        category_id: "",
        status: 1,
        featured: 0,
      });
      setSkus([
        {
          size_attribute_id: "M",
          color_attribute_id: "Đen",
          sku: "",
          price: "",
          quantity: "",
          image: null,
          imagePreview: null,
        },
      ]);
    } catch (error) {
      console.error("Error adding product:", error);
      alert(error.message || "Thêm sản phẩm thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Thêm Sản Phẩm Mới</h2>

        <form onSubmit={handleSubmit}>
          {/* Product Information */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Thông tin cơ bản</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tên sản phẩm
                </label>
                <input
                  type="text"
                  name="name"
                  value={product.name}
                  onChange={handleProductChange}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea
                  name="description"
                  value={product.description}
                  onChange={handleProductChange}
                  rows="4"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Danh mục
                </label>
                <select
                  name="category_id"
                  value={product.category_id}
                  onChange={handleProductChange}
                  className="w-full border rounded-md px-3 py-2"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SKU List */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Danh sách SKU</h3>
              <button
                type="button"
                onClick={addNewSku}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                disabled={loading}
              >
                Thêm SKU
              </button>
            </div>

            {skus.map((sku, index) => (
              <div key={index} className="border rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">SKU #{index + 1}</h4>
                  {skus.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSku(index)}
                      className="text-red-500 hover:text-red-600"
                      disabled={loading}
                    >
                      Xóa
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Kích thước
                    </label>
                    <select
                      name="size_attribute_id"
                      value={sku.size_attribute_id}
                      onChange={(e) => handleSkuChange(index, e)}
                      className="w-full border rounded-md px-3 py-2"
                    >
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Màu sắc
                    </label>
                    <select
                      name="color_attribute_id"
                      value={sku.color_attribute_id}
                      onChange={(e) => handleSkuChange(index, e)}
                      className="w-full border rounded-md px-3 py-2"
                    >
                      <option value="Đỏ">Màu đỏ</option>
                      <option value="Xanh">Màu xanh</option>
                      <option value="Vàng">Màu vàng</option>
                      <option value="Trắng">Màu trắng</option>
                      <option value="Đen">Màu đen</option>
                      <option value="Hồng">Màu hồng</option>
                      <option value="Xám">Màu xám</option>
                      <option value="Nâu">Màu nâu</option>
                      <option value="Tím">Màu tím</option>
                      <option value="Cam">Màu cam</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Mã SKU
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={sku.sku}
                      onChange={(e) => handleSkuChange(index, e)}
                      className="w-full border rounded-md px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Giá
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={sku.price}
                      onChange={(e) => handleSkuChange(index, e)}
                      className="w-full border rounded-md px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Số lượng
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={sku.quantity}
                      onChange={(e) => handleSkuChange(index, e)}
                      className="w-full border rounded-md px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Hình ảnh
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(index, e)}
                      className="w-full border rounded-md px-3 py-2"
                    />
                    {sku.imagePreview && (
                      <img
                        src={sku.imagePreview}
                        alt="Preview"
                        className="mt-2 max-w-xs rounded"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Lưu sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm;