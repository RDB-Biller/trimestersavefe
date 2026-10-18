import img from "assets/images/404_Error.svg";
import Button from "components/Button";
import { Link, useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      <img
        src={img}
        alt="404"
        className="w-80 md:w-[500px] h-auto object-cover"
      />
      <div className="w-56">
        <Button title={"Go Back To Safety"} onClick={() => navigate(-1)} />
      </div>
      <p className="text-sm mt-6 text-center">
        <b>Or go straight to:</b>{" "}
        <Link className="underline text-primary font-semibold" to="/">Sign in</Link> · <Link className="underline text-primary font-semibold" to="/register">Create an account</Link> · <Link className="underline text-primary font-semibold" to="/birthprep">Start a BirthPrep plan</Link>
      </p>
    </div>
  );
};

export default NotFound;
