import React from 'react'
import ManagementLayout from "@/layouts/management";
import { useForm, useFieldArray } from 'react-hook-form';

const AddOrganization = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      address: [{ city: '', state: '', postalCode: '', officeNumber: '' }], // Default one address field
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'address'
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <div className="container">
    <h2 className="my-4">Company Form</h2>
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="row">
        {/* Company Name */}
        <div className="col-md-4 mb-3">
          <label htmlFor="companyName" className="form-label">Company Name</label>
          <input
            type="text"
            className={`form-control ${errors.companyName ? 'is-invalid' : ''}`}
            id="companyName"
            {...register('companyName', { required: 'Company Name is required' })}
          />
          {errors.companyName && (
            <div className="invalid-feedback">{errors.companyName.message}</div>
          )}
        </div>

        {/* Company Email */}
        <div className="col-md-4 mb-3">
          <label htmlFor="companyEmail" className="form-label">Company Email</label>
          <input
            type="email"
            className={`form-control ${errors.companyEmail ? 'is-invalid' : ''}`}
            id="companyEmail"
            {...register('companyEmail', {
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Invalid email address',
              },
            })}
          />
          {errors.companyEmail && (
            <div className="invalid-feedback">{errors.companyEmail.message}</div>
          )}
        </div>

        {/* Website */}
        <div className="col-md-4 mb-3">
          <label htmlFor="website" className="form-label">Website</label>
          <input
            type="text"
            className="form-control"
            id="website"
            {...register('website')}
          />
        </div>
      </div>

      <div className="row">
        {/* GSTN */}
        <div className="col-md-4 mb-3">
          <label htmlFor="GSTN" className="form-label">GSTN</label>
          <input
            type="text"
            className="form-control"
            id="GSTN"
            {...register('GSTN')}
          />
        </div>

        {/* PAN */}
        <div className="col-md-4 mb-3">
          <label htmlFor="PAN" className="form-label">PAN</label>
          <input
            type="text"
            className="form-control"
            id="PAN"
            {...register('PAN')}
          />
        </div>

        {/* Description */}
        <div className="col-md-4 mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            className="form-control"
            id="description"
            rows="3"
            {...register('description')}
          />
        </div>
      </div>

      {/* Address Section */}
      <div className="mb-3">
        <label className="form-label">Address</label>
        {fields.map((item, index) => (
          <div key={item.id} className="border p-3 mb-2 rounded">
            <div className="row">
              {/* City */}
              <div className="col-md-3 mb-3">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-control"
                  {...register(`address.${index}.city`)}
                />
              </div>

              {/* State */}
              <div className="col-md-3 mb-3">
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="form-control"
                  {...register(`address.${index}.state`)}
                />
              </div>

              {/* Postal Code */}
              <div className="col-md-3 mb-3">
                <label className="form-label">Postal Code</label>
                <input
                  type="number"
                  className="form-control"
                  {...register(`address.${index}.postalCode`)}
                />
              </div>

              {/* Office Number */}
              <div className="col-md-3 mb-3">
                <label className="form-label">Office Number</label>
                <input
                  type="number"
                  className="form-control"
                  {...register(`address.${index}.officeNumber`)}
                />
              </div>
            </div>

            {/* Remove Address Button */}
            {fields.length > 1 && (
              <button
                type="button"
                className="btn btn-danger mt-2"
                onClick={() => remove(index)}
              >
                Remove Address
              </button>
            )}
          </div>
        ))}

        {/* Add Address Button */}
        <button
          type="button"
          className="btn btn-secondary mt-3"
          onClick={() =>
            append({ city: '', state: '', postalCode: '', officeNumber: '' })
          }
        >
          Add Address
        </button>
      </div>

      {/* Submit Button */}
      <button type="submit" className="btn btn-primary">Submit</button>
    </form>
  </div>
  );
}

AddOrganization.getLayout = (page) => <ManagementLayout>{page}</ManagementLayout>;

export default AddOrganization