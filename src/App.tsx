import './App.css';
import { RouterProvider } from 'react-router-dom';
import router from './routes/router';
import { RegistrationProvider } from './context/RegistrationProvider';
import { TeamMembersProvider } from './context/TeamMembersProvider';
import { ReferralProvider } from './context/ReferralProvider';
import { UserProvider } from './context/UserProvider';
// import { AdminUserProvider } from './adminContext/AdminUserProvider';
// import { AdminCompanyProvider } from './adminContext/AdminCompanyProvider';
// import { AdminTicketProvider } from './adminContext/AdminTicketProvider';
// import { AdminReviewProvider } from './adminContext/AdminReviewProvider';



function App() {

  return (
  <>
    {/* <AdminReviewProvider>
        <AdminCompanyProvider>
          <AdminTicketProvider>
            <AdminUserProvider> */}
              <UserProvider>
                <ReferralProvider>
                    <TeamMembersProvider>
                      <RegistrationProvider>
                              <RouterProvider router={router} /> 
                      </RegistrationProvider>
                    </TeamMembersProvider>
                  </ReferralProvider>
              </UserProvider>
              {/* </AdminUserProvider>
          </AdminTicketProvider>
        </AdminCompanyProvider>
    </AdminReviewProvider> */}
  </>
  )
}


export default App;
