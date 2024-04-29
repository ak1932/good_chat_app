'use client';
import { Formik, Field, Form } from "formik";
import { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as Yup from "yup";
import { AccountContext } from "../components/AccountContext";
import ErrText from "../components/ErrText";

export default function Home() {
    const formSchema = Yup.object({
        username: Yup.string()
            .required("Username required")
            .min(6, "Username too short")
            .max(28, "Username too long!"),
        password: Yup.string()
            .required("Password required")
            .min(6, "Password too short")
            .max(28, "Password too long!"),
    });
    const { setUser } = useContext(AccountContext);
    const [error, setError] = useState(null);
    const router = useRouter();
    return (
        <div className="w-screen h-screen text-black grid place-content-center bg-theme_yellow">
            <div className="flex border-2 border-theme_gray shadow-theme flex-col p-10">
                <h1 className="text-2xl font-bold text-center">SIGNUP</h1>
                <ErrText error={error} />
                <Formik
                    initialValues={{ username: "", password: "" }}
                    validationSchema={formSchema}
                    onSubmit={(values, actions) => {
                        console.log("hello hoe")
                        const vals = { ...values };
                        actions.resetForm();
                        fetch("http://localhost:4000/auth/register", {
                            method: "POST",
                            headers: {
                                "Access-Control-Allow-Origin": "http://localhost:4000",
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(vals),
                            credentials: "include"
                        })
                            .catch(err => {
                                return;
                            })
                            .then(res => {
                                if (!res || !res.ok || res.status >= 400) {
                                    return;
                                }
                                return res.json();
                            })
                            .then(data => {
                                if (!data) return;
                                if (data.status) {
                                    setError(data.status);
                                } else if (data.user) {
                                    setUser(data.user);
                                    router.push('/');
                                }
                            });
                    }}
                >
                    {(formik) => {
                        const fieldStyle="m-6 bg-theme_yellow border-theme_gray border-b-2 focus:outline-0 focus:outline-none w-72"
                        return (<Form>
                            <label htmlFor="username">Username:</label>
                            <Field name="username" type="text" className={fieldStyle} value={formik.values.username} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                            <br />
                            <label htmlFor="password">Password:</label>
                            <Field name="password" type="password" className={fieldStyle} value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                            <br />
                            <div className="flex flex-row">
                            <button type="submit" className={`px-4 py-2 border-2 border-theme_gray text-theme_gray hover:shadow-theme hover:-translate-x-[5px] hover:-translate-y-[5px]  active:bg-theme_gray active:text-theme_yellow active:shadow-white font-bold justify-center items-center flex transition-transform transition-dur`}>
                                CREATE ACCOUNT
                            </button>
                            <button onClick={() => { router.replace("/login") }} className={`ml-auto px-4 py-2 border-2 border-theme_gray text-theme_gray hover:shadow-theme hover:-translate-x-[5px] hover:-translate-y-[5px]  active:bg-theme_gray active:text-theme_yellow active:shadow-white font-bold justify-center items-center flex transition-transform transition-dur`}>
                                Been here before?
                            </button>
                            </div>
                        </Form>)
                    }}
                </Formik>
            </div>
        </div>
    );
}

