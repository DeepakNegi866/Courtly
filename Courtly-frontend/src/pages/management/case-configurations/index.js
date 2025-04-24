
const index = () => {
      return null; // Do not render if redirecting
};

export  function getServerSideProps() {
  
    return {
      redirect: {
        destination: "/management/case-configurations/high_courts",
        permanent: true,
      },
    }
  }

export default index;
