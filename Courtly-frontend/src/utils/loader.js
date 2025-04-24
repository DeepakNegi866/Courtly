export const SpinLoader = ({color = '#FDD106'})=> {
<div className="spinner-border text-warning " role="status">
  <span className="sr-only">Loading...</span>
</div>
}

export const Loading = () =>{
    <button className="btn btn-primary" type="button" disabled>
    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    Loading...
  </button>
}