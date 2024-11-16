import React, { useState, useEffect } from 'react';
import axios from 'axios'; // axios를 통해 POST 요청 전송
import { useNavigate, useParams } from 'react-router-dom';
import * as Styled from './InputServiceInfo.styled';
import ThumbnailTotal from '../assets/ThumbnailTotal.svg';
import servicePhotoFile from '../assets/servicePhotoFile.svg';
import upload from '../assets/upload.svg';
import changeThumbnail from '../assets/changeThumbnail.svg';
import Header from '../layouts/Header';
import Footer from '../layouts/Footer';
import { useAuth } from "../contexts/AuthContext";
import { TeamMember } from '../pages/MyService.styled';

const InputServiceInfo = ({ API_BASE_URL }) => {
    const navigate = useNavigate();
    const [serviceName, setServiceName] = useState(''); // 서비스 이름
    const [thumbnailImage, setThumbnailImage] = useState(ThumbnailTotal); // 썸네일 이미지
    const [intro, setIntro] = useState(''); // 한 줄 소개
    const [content, setContent] = useState(''); // 기능 설명
    const [siteUrl, setSiteUrl] = useState(''); // 서비스 URL
    const [teamNum, setTeamNum] = useState(''); // 팀 번호
    const [teamName, setTeamName] = useState(''); // 팀 이름
    const [uploadedImages, setUploadedImages] = useState([]); // 발표자료 이미지 배열
    const maxImages = 10;
    const [serviceData, setServiceData] = useState(null);
    const { isAuthenticated, accessToken } = useAuth();
    const { service_id } = useParams();

    //정보 받아오기
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("accessToken"); // 토큰 확인

            if (!token) {
                alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
                navigate("/login");
                return;
            }

            try {
                const response = await axios.get(`${API_BASE_URL}/services/4line-services/${service_id}`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`, // 인증 토큰 추가
                        },
                    });
                // 서비스 데이터 및 좋아요 상태 설정
                const serviceData = response.data;
                setServiceData(serviceData);
                console.log("받아온 서비스 데이터:", serviceData);

            } catch (error) {
                if (error.response) {
                    // 서버가 응답은 했지만 오류가 발생한 경우
                    console.error('서버 응답 오류:', error.response.data);
                } else if (error.request) {
                    // 요청은 보냈지만 응답을 받지 못한 경우
                    console.error('서버 응답 없음:', error.request);
                } else {
                    // 요청 설정 시 오류가 발생한 경우
                    console.error('요청 오류:', error.message);
                }
                alert('서비스 등록에 실패했습니다.');
            }
        };

        fetchData();
    }, [API_BASE_URL, service_id, accessToken]);

    const handleImageUpload = (event) => {
        const files = event.target.files;
        if (files) {
            const imageUrls = Array.from(files).map(file => URL.createObjectURL(file));
            setUploadedImages(prevImages => [...prevImages, ...imageUrls].slice(0, maxImages));
        }
    };

    const handleThumbnailUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setThumbnailImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
                navigate("/login");
                return;
            }
    
            // `service_id` 확인 및 디버깅
            if (!service_id) {
                console.error("service_id가 정의되지 않았습니다.");
                return;
            }
    
            const url = `${API_BASE_URL}/services/4line-services/${service_id}`;
            console.log(url);
            const patchData = {
                service_name: serviceName,
                thumbnail_image: thumbnailImage,
                intro,
                content,
                site_url: siteUrl,
                team_num: parseInt(teamNum, 10),
                team_name: teamName,
                presentation: uploadedImages,
            };
    
            const response = await axios.patch(url, patchData, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            console.log("등록된 서비스 데이터:", patchData);
            console.log("서버 응답:", response.data);
    
            setServiceName("");
            setIntro("");
            setContent("");
            setSiteUrl("");
            setTeamNum("");
            setTeamName("");
            setUploadedImages([]);
            setThumbnailImage(ThumbnailTotal);
            navigate(`/Detail/${service_id}`);
        } catch (error) {
            console.error("서비스 등록 오류:", error.response?.data || error.message || error);
            alert(error.response?.data?.message || "서비스 등록에 실패했습니다.");
        }
    };

    const categories = ['PD', 'FE', 'BE'];
    //멤버 불러오기
    useEffect(() => {
        if (serviceData?.member) {
            const initialCategories = serviceData.member.reduce(
                (acc, member) => ({ ...acc, [member.id]: null }),
                {}
            );
            setSelectedCategories(initialCategories);
        }
    }, [serviceData]);

    
    // 선택된 카테고리를 저장하는 상태 (수정 필요)
    const teamMember =[]
    const [selectedCategories, setSelectedCategories] = useState(
        teamMember.reduce((acc, member) => ({ ...acc, [member.id]: null }), {})
    );

    const handleCategoryChange = (memberId, category) => {
        setSelectedCategories(prevState => ({
            ...prevState,
            [memberId]: prevState[memberId] === category ? null : category
        }));
    };

    return (
        <Styled.Wrapper>
            <Header isWhiteBackground={true} />
            <Styled.Content>
                <Styled.Header>
                    <Styled.ThumbnailBox>
                        <Styled.ChangeThumbnail
                            src={changeThumbnail}
                            alt="changeThumbnail"
                            onClick={() => document.getElementById('thumbnailInput').click()}
                        />
                        <input
                            id="thumbnailInput"
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleThumbnailUpload}
                        />
                        {serviceData && serviceData.thumbnail_image ? (
                            <Styled.ThumbnailImage src={serviceData.thumbnail_image} alt="서비스 썸네일" />
                        ) : (
                            <Styled.ThumbnailImage src={ThumbnailTotal} alt="기본 썸네일" />
                        )}
                    </Styled.ThumbnailBox>
                    <Styled.ChangeBox>
                    </Styled.ChangeBox>

                </Styled.Header>

                <Styled.Background>
                    <Styled.InfoBox>
                        <Styled.InfoTitle>N팀 서비스 정보 입력</Styled.InfoTitle>
                        <Styled.ServiceName>내 서비스 이름은 무엇인가요?</Styled.ServiceName>
                        <Styled.ServiceNameInput
                            type="text"
                            placeholder="서비스 이름을 알려주세요"
                            value={serviceName || (serviceData?.service_name || '')}
                            onChange={(e) => setServiceName(e.target.value)}
                        />
                        <Styled.ServiceSimple>서비스를 한 문장으로 설명한다면?</Styled.ServiceSimple>
                        <Styled.ServiceSimpleInput
                            type="text"
                            placeholder="한 줄 소개를 적어주세요"
                            value={intro || (serviceData?.intro || '')}
                            onChange={(e) => setIntro(e.target.value)}
                        />
                        <Styled.ServiceURL>서비스 URL이 있다면 입력해주세요!</Styled.ServiceURL>
                        <Styled.ServiceURLInput
                            type="text"
                            placeholder="배포된 서비스가 없다면 공란으로 유지해주세요"
                            value={siteUrl || (serviceData?.site_url || '')}
                            onChange={(e) => setSiteUrl(e.target.value)}
                        />

                        <Styled.PartInput>파트 정보를 입력해주세요.</Styled.PartInput>
                        <Styled.PartInfo>
                            {/* Header Row with Underlines */}
                            <Styled.HeaderRow>
                                <Styled.HeaderLabel>이름</Styled.HeaderLabel>
                                {categories.map((category) => (
                                    <Styled.HeaderLabel key={category}>{category}</Styled.HeaderLabel>
                                ))}
                            </Styled.HeaderRow>

                            {/* Team Member Rows */}
                            {serviceData?.members && serviceData.members.length > 0 ? (
                                serviceData.members.map((member) => (
                                    <Styled.MemberRow key={member.id}>
                                        <Styled.MemberName>{member.member}</Styled.MemberName>
                                        <CheckboxGroup
                                            categories={categories}
                                            selectedCategory={selectedCategories[member.id]}
                                            onCategoryChange={(category) => handleCategoryChange(member.id, category)}
                                        />
                                    </Styled.MemberRow>
                                ))
                            ) : (
                                <div>팀원이 아직 등록되지 않았습니다.</div>
                            )}
                        </Styled.PartInfo>

                        <Styled.ServiceDetail>어떤 기능이 있는지 자세히 알려주세요!</Styled.ServiceDetail>
                        <Styled.ServiceDetailInput
                            as="textarea"
                            placeholder=" "
                            value={
                                content ||
                                (serviceData?.content ||
                                    `✨‘4호선톤’을 위한 우리들만의 축제 사이트✨   

[문제제기]❔
 - [일상 속 문제 상황]
 - [일상 속 의문점]
 - [서비스를 만들게 된 계기]
이런 상황을 해결할 수는 없을까…?

😵 기존 문제 상황1, ➡ 서비스가 제공하는 해결책1
🤔 기존 문제 상황2, ➡ 서비스가 제공하는 해결책2  

이제는 [서비스명]에서 간편하게 [문제 상황 해결]을 해보세요!🙌 

 🌀 [서비스명]의 핵심 기능 소개🥳♫

➊주요 기능1 여기에 기능을 설명해주세요
➋주요 기능2 여기에 기능을 설명해주세요`)
                            }
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <Styled.ServicePPTContainer>
                            <Styled.ServicePPT>마지막으로 발표자료를 업로드 해보세요!</Styled.ServicePPT>
                            <Styled.PPTCount>
                                <Styled.UploadedCount>{uploadedImages.length}</Styled.UploadedCount>/
                                <Styled.MaxCount>{maxImages}</Styled.MaxCount>
                            </Styled.PPTCount>
                            <Styled.ImageUploadButton onClick={() => document.getElementById('fileInput').click()}>
                                <Styled.ImageUpload src={upload} alt="upload" />
                            </Styled.ImageUploadButton>
                            <input
                                id="fileInput"
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleImageUpload}
                                multiple // Enable multiple file selection
                            />
                        </Styled.ServicePPTContainer>

                        <Styled.ImageGallery>
                            {uploadedImages.length > 0 ? (
                                uploadedImages.map((image, index) => (
                                    <Styled.ServicePhotoFile key={index} src={image} alt={`uploaded service file ${index + 1}`} />
                                ))
                            ) : (
                                <Styled.ServicePhotoFile src={servicePhotoFile} alt="default service file" />
                            )}
                        </Styled.ImageGallery>
                        <Styled.Bottom>
                            <Styled.GoBack >&lt; 이전</Styled.GoBack>
                            <Styled.SignUp onClick={handleSubmit}>등록하기</Styled.SignUp>
                        </Styled.Bottom>
                    </Styled.InfoBox>
                </Styled.Background>
            </Styled.Content>
            <Footer />
        </Styled.Wrapper>
    );
};

const CheckboxGroup = ({ categories, selectedCategory, onCategoryChange }) => {
    return (
        <Styled.CheckboxContainer>
            {categories.map((category) => (
                <Styled.CheckboxWrapper key={category}>
                    <input
                        type="checkbox"
                        checked={selectedCategory === category}
                        onChange={() => onCategoryChange(category)}
                    />
                </Styled.CheckboxWrapper>
            ))}
        </Styled.CheckboxContainer>
    );
};

export default InputServiceInfo;
